package state

import (
	"slices"
	"sync"
	"war-of-faith/pkg/option"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/google/uuid"
	"github.com/samber/lo"
	"golang.org/x/exp/maps"
)

var (
	Building_HALL      = "hall"
	Building_GOLD_MINE = "gold-mine"

	Troop_LEADER = "leader"
)

type World struct {
	*serverv1.World
	sync.RWMutex
	patchChan chan *serverv1.SubscribeToWorldResponse_Patch
}

func (w *World) Tick() {
	// Process attacks
	for _, attack := range w.TroopMovementOrders {
		attack.TimeLeft--
		if attack.TimeLeft == 0 {
			// Update world field
			sourceVillage := w.Villages[attack.SourceCoords]
			targetField := w.Fields[attack.TargetCoords]
			switch targetField.Kind {
			case serverv1.World_Field_KIND_WILD:
				w.CreateVillage(attack.TargetCoords, sourceVillage.PlayerId)
				// delete(w.TroopMovementOrders, attack.Id)

			case serverv1.World_Field_KIND_VILLAGE:
				targetVillage := w.Villages[attack.TargetCoords]
				if targetVillage.PlayerId == sourceVillage.PlayerId {
					// TODO: Add attack troop quantity to target village
				} else {
					// TODO: Combat

					if attack.Troops[Troop_LEADER] > 0 {
						targetVillage.PlayerId = sourceVillage.PlayerId
					}
				}
				// delete(w.TroopMovementOrders, attack.Id)

			case serverv1.World_Field_KIND_TEMPLE:
				w.CancelTroopMovementOrder(attack.Id, sourceVillage.PlayerId) // TODO: Handle error
			}
		}
	}

	for _, village := range w.Villages {
		// Process resources
		village.Resources.Gold += 1 // TODO: Dynamic resources

		// Process troop training orders
		if len(village.TroopTrainingOrders) > 0 {
			order := village.TroopTrainingOrders[0]
			order.TimeLeft--
			if order.TimeLeft == 0 {
				village.TroopTrainingOrders = village.TroopTrainingOrders[1:]
				village.Troops[order.TroopId] += 1
			}
		}

		// Process building upgrade orders
		if len(village.BuildingUpgradeOrders) > 0 {
			order := village.BuildingUpgradeOrders[0]
			order.TimeLeft--
			if order.TimeLeft == 0 {
				village.BuildingUpgradeOrders = village.BuildingUpgradeOrders[1:]
				village.Buildings[order.BuildingId] += 1
			}
		}

		// Process resource transfer orders
		village.ResourceTransferOrders = lo.Filter(village.ResourceTransferOrders, func(order *serverv1.Village_ResourceTransferOrder, _ int) bool {
			order.TimeLeft--
			if order.TimeLeft == 0 {
				targertField := w.Fields[order.TargetCoords]
				switch targertField.Kind {
				case serverv1.World_Field_KIND_VILLAGE:
					targetVillage := w.Villages[order.TargetCoords]
					targetVillage.Resources.Gold += order.Resources.Gold
					return false

				case serverv1.World_Field_KIND_TEMPLE:
					targetTemple := w.Temples[order.TargetCoords]
					targetTemple.Resources.Gold += order.Resources.Gold
					return false

				default:
					w.CancelResourceTransferOrder(village.Coords, order.Id, village.PlayerId) // TODO: Handler error
				}
			}
			return true
		})
	}

	w.patchChan <- &serverv1.SubscribeToWorldResponse_Patch{
		Fields:              maps.Clone(w.Fields),
		Villages:            maps.Clone(w.Villages),
		Temples:             maps.Clone(w.Temples),
		TroopMovementOrders: slices.Clone(w.TroopMovementOrders),
	}
}

func (w *World) CreateVillage(coords string, playerId string) {
	w.Fields[coords] = &serverv1.World_Field{
		Coords: coords,
		Kind:   serverv1.World_Field_KIND_VILLAGE,
	}
	w.Villages[coords] = &serverv1.Village{
		Coords:    coords,
		PlayerId:  playerId,
		Resources: &serverv1.Resources{},
		Buildings: map[string]uint32{
			Building_HALL:      1,
			Building_GOLD_MINE: 1,
		},
		Troops: map[string]uint32{
			Troop_LEADER: 0,
		},
	}
}

func (w *World) CreateTemple(coords string) {
	w.Fields[coords] = &serverv1.World_Field{
		Coords: coords,
		Kind:   serverv1.World_Field_KIND_TEMPLE,
	}
	w.Temples[coords] = &serverv1.Temple{
		Coords:    coords,
		Resources: &serverv1.Resources{},
	}
}

func (w *World) IssueTroopMovementOrder(req *serverv1.IssueTroopMovementOrderRequest, playerId string) (*serverv1.TroopMovementOrder, error) {
	sourceVillage, ok := w.Villages[req.SourceCoords]
	if !ok {
		return nil, ErrVillageNotFound
	}

	// Do you own the source village?
	if sourceVillage.PlayerId != playerId {
		return nil, ErrNotYourVillage
	}

	// Do you have enough troops?
	for troopId, quantity := range req.Troops {
		available := sourceVillage.Troops[troopId]
		if quantity > available {
			// TODO: Not enough troops
		}
	}

	// TroopMovementOrder
	for troopId, quantity := range req.Troops {
		sourceVillage.Troops[troopId] -= quantity
	}
	attack := &serverv1.TroopMovementOrder{
		Id:           uuid.NewString(), // TODO: Use uuid v7
		SourceCoords: req.SourceCoords,
		TargetCoords: req.TargetCoords,
		Troops:       req.Troops,
		TimeLeft:     10, // TODO: Dynamic time left
	}
	w.TroopMovementOrders = append(w.TroopMovementOrders, attack)

	return attack, nil
}

func (w *World) CancelTroopMovementOrder(id string, playerId string) error {
	attack, ok := lo.Find(w.TroopMovementOrders, func(order *serverv1.TroopMovementOrder) bool {
		return order.Id == id
	})
	if !ok {
		// TODO: TroopMovementOrder not found
	}
	sourceVillage, ok := w.Villages[attack.SourceCoords]
	if !ok {
		return ErrVillageNotFound
	}

	// Do you own the source village?
	if sourceVillage.PlayerId != playerId {
		return ErrNotYourVillage
	}

	// Return
	attack.TargetCoords = attack.SourceCoords
	attack.TimeLeft = 10 - attack.TimeLeft // TODO: Dynamic time left

	return nil
}

func (w *World) IssueResourceTransferOrder(req *serverv1.IssueResourceTransferOrderRequest, playerId string) (*serverv1.Village_ResourceTransferOrder, error) {
	sourceVillage, ok := w.Villages[req.SourceCoords]
	if !ok {
		return nil, ErrVillageNotFound
	}

	// Do you own the source village?
	if sourceVillage.PlayerId != playerId {
		return nil, ErrNotYourVillage
	}

	// Do you have enough resources?
	for req.Resources.Gold > sourceVillage.Resources.Gold {
		// TODO: Not enough resources
	}

	// Send
	sourceVillage.Resources.Gold -= req.Resources.Gold
	order := &serverv1.Village_ResourceTransferOrder{
		Id:           uuid.NewString(), // TODO: Use uuid v7
		Resources:    req.Resources,
		TargetCoords: req.TargetCoords,
		TimeLeft:     10, // TODO: Dynamic time left
	}
	sourceVillage.ResourceTransferOrders = append(sourceVillage.ResourceTransferOrders, order)

	return order, nil
}

func (w *World) CancelResourceTransferOrder(sourceCoords string, id string, playerId string) error {
	sourceVillage, ok := w.Villages[sourceCoords]
	if !ok {
		// TODO: TroopMovementOrder not found
	}

	// Do you own the source village?
	if sourceVillage.PlayerId != playerId {
		return ErrNotYourVillage
	}

	orderOpt := option.None[*serverv1.Village_ResourceTransferOrder]()
	for _, order := range sourceVillage.ResourceTransferOrders {
		if order.Id == id {
			orderOpt = option.Some[*serverv1.Village_ResourceTransferOrder](order)
			break
		}
	}
	if !orderOpt.Valid {
		// TODO: Order not found
	}

	// Return
	orderOpt.V.TargetCoords = sourceCoords
	orderOpt.V.TimeLeft = 10 - orderOpt.V.TimeLeft // TODO: Dynamic time left

	return nil
}
