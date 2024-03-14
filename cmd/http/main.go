package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/bufbuild/connect-go"
	"github.com/bufbuild/protovalidate-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/samber/lo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/reflect/protoreflect"

	"war-of-faith/cmd/http/db"
	"war-of-faith/cmd/http/model"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	"war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	serverv1.UnimplementedServiceServer
}

/* VILLAGES */
func (s *Server) GetVillage(ctx context.Context, req *connect.Request[serverv1.GetVillageRequest]) (*connect.Response[serverv1.GetVillageResponse], error) {
	village, found, err := model.GetVillage(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Errorf(codes.NotFound, "village (id: %d) not found", req.Msg.Id)
	}

	pVillage, err := village.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert village to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetVillageResponse{Village: pVillage}), nil
}

func (s *Server) GetVillages(ctx context.Context, req *connect.Request[serverv1.GetVillagesRequest]) (*connect.Response[serverv1.GetVillagesResponse], error) {
	villages, err := model.GetVillages(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get villages: %w", err)
	}

	pVillages := make([]*serverv1.Village, len(villages))
	for i, v := range villages {
		pVillage, err := v.ToProtobuf(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to convert village to protobuf: %w", err)
		}
		pVillages[i] = pVillage
	}

	return connect.NewResponse(&serverv1.GetVillagesResponse{Villages: pVillages}), nil
}

/* BUILDINGS */
func (s *Server) GetBuildings(ctx context.Context, req *connect.Request[serverv1.GetBuildingsRequest]) (*connect.Response[serverv1.GetBuildingsResponse], error) {
	return connect.NewResponse(&serverv1.GetBuildingsResponse{
		Buildings: lo.Map(model.BuildingKinds, func(t model.Building_Kind, _ int) *serverv1.Building { return t.ToBuildingProtobuf() }),
	}), nil
}

func (s *Server) IssueBuildingUpgradeOrder(ctx context.Context, req *connect.Request[serverv1.IssueBuildingUpgradeOrderRequest]) (*connect.Response[serverv1.IssueBuildingUpgradeOrderResponse], error) {
	village, found, err := model.GetVillage(ctx, req.Msg.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	buildingKind, err := model.Building_KindFromProtobuf(req.Msg.BuildingKind)
	if err != nil {
		return nil, fmt.Errorf("failed to convert building kind to protobuf: %w", err)
	}

	nextUpgradeLevel, err := village.NextBuildingUpgradeLevel(ctx, buildingKind)
	if err != nil {
		return nil, fmt.Errorf("failed to get building (kind: %s) next upgrade level: %w", buildingKind, err)
	}
	if nextUpgradeLevel > model.BuildingMaxLevel {
		return nil, status.Error(codes.FailedPrecondition, "building is already at max level")
	}

	cost := buildingKind.CalculateUpgradeCost(nextUpgradeLevel, village.BuildingLevel.Get(model.Building_Kind_HALL))
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}

	village.SpendResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	order, err := model.CreateBuildingUpgradeOrder(ctx, &model.BuildingUpgradeOrder{
		Level:        nextUpgradeLevel,
		TimeLeft:     cost.Time,
		BuildingKind: buildingKind,
		VillageId:    village.Id,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create building upgrade order: %w", err)
	}

	pOrder, err := order.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert building upgrade order to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.IssueBuildingUpgradeOrderResponse{Order: pOrder}), nil
}

func (s *Server) CancelBuildingUpgradeOrder(ctx context.Context, req *connect.Request[serverv1.CancelBuildingUpgradeOrderRequest]) (*connect.Response[serverv1.CancelBuildingUpgradeOrderResponse], error) {
	order, found, err := model.GetBuildingUpgradeOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get building upgrade order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "building upgrade order not found")
	}

	village, found, err := model.GetVillage(ctx, order.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	orders, err := model.GetBuildingUpgradeOrders(ctx, sq.Eq{"building_kind": order.BuildingKind}, db.OrderQueryOption{Column: "level", Desc: true})
	if err != nil {
		return nil, fmt.Errorf("failed to get building (kind: %s) upgrade orders: %w", order.BuildingKind, err)
	}
	if order.Id != orders[0].Id {
		return nil, status.Error(codes.FailedPrecondition, "building upgrade order is not the latest order")
	}

	cost := order.BuildingKind.CalculateUpgradeCost(order.Level, village.BuildingLevel.Get(model.Building_Kind_HALL))
	village.EarnResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	err = model.DeleteBuildingUpgradeOrder(ctx, order.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete building upgrade order: %w", err)
	}

	return connect.NewResponse(&serverv1.CancelBuildingUpgradeOrderResponse{}), nil
}

/* TROOPS */
func (s *Server) GetTroops(ctx context.Context, req *connect.Request[serverv1.GetTroopsRequest]) (*connect.Response[serverv1.GetTroopsResponse], error) {
	return connect.NewResponse(&serverv1.GetTroopsResponse{
		Troops: lo.Map(model.TroopKinds, func(t model.Troop_Kind, _ int) *serverv1.Troop { return t.ToTroopProtobuf() }),
	}), nil
}

func (s *Server) IssueTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.IssueTroopTrainingOrderRequest]) (*connect.Response[serverv1.IssueTroopTrainingOrderResponse], error) {
	village, found, err := model.GetVillage(ctx, req.Msg.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	troopKind, err := model.Troop_KindFromProtobuf(req.Msg.TroopKind)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid troop kind")
	}

	cost := troopKind.CalculateTrainingCost(req.Msg.Quantity, 0)
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}
	if troopKind == model.Troop_Kind_LEADER {
		trainableLeaders, err := model.GetPlayerTrainableLeaders(ctx, village.PlayerId)
		if err != nil {
			return nil, fmt.Errorf("failed to get player trainable leaders: %w", err)
		}
		if trainableLeaders <= 0 {
			return nil, status.Error(codes.FailedPrecondition, "no more leaders can be trained")
		}
	}

	village.SpendResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	order, err := model.CreateTroopTrainingOrder(ctx, &model.TroopTrainingOrder{
		Quantity:  req.Msg.Quantity,
		TimeLeft:  cost.Time,
		TroopKind: troopKind,
		VillageId: village.Id,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create troop training order: %w", err)
	}

	pOrder, err := order.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert troop training order to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.IssueTroopTrainingOrderResponse{Order: pOrder}), nil
}

func (s *Server) CancelTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.CancelTroopTrainingOrderRequest]) (*connect.Response[serverv1.CancelTroopTrainingOrderResponse], error) {
	order, found, err := model.GetTroopTrainingOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop training order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop training order not found")
	}

	village, err := order.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village (id: %d): %w", order.VillageId, err)
	}

	cost := order.TroopKind.CalculateTrainingCost(order.Quantity, 0)
	village.EarnResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	err = model.DeleteTroopTrainingOrder(ctx, order.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete troop training order: %w", err)
	}

	return connect.NewResponse(&serverv1.CancelTroopTrainingOrderResponse{}), nil
}

func (s *Server) IssueTempleDonationOrder(ctx context.Context, req *connect.Request[serverv1.IssueTempleDonationOrderRequest]) (*connect.Response[serverv1.IssueTempleDonationOrderResponse], error) {
	// TODO: Wrap in transaction
	temple, err := db.First[model.Temple](ctx, sq.Select("*").From(model.TemplesTableName), sq.Eq{"id": req.Msg.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to get temple: %w", err)
	}

	village, err := db.First[model.Village](ctx, sq.Select("*").From(model.VillagesTableName), sq.Eq{"id": req.Msg.VillageId})
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}

	if !village.CanAfford(model.Resources{Gold: req.Msg.Gold}) {
		return nil, status.Error(codes.FailedPrecondition, "not enough gold")
	}
	village.SpendResources(model.Resources{Gold: req.Msg.Gold})
	err = db.Update(ctx, model.VillagesTableName, village, sq.Eq{"id": village.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	// TODO: Create TempleDonationOrder
	// TODO: Ability to cancel TempleDonationOrder

	temple.Gold += req.Msg.Gold
	err = db.Update(ctx, model.TemplesTableName, temple, sq.Eq{"id": temple.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to update temple: %w", err)
	}

	return connect.NewResponse(&serverv1.IssueTempleDonationOrderResponse{}), nil
}

/* TEMPLES */
func (s *Server) GetTemple(ctx context.Context, req *connect.Request[serverv1.GetTempleRequest]) (*connect.Response[serverv1.GetTempleResponse], error) {
	temple, found, err := db.FindOne[model.Temple](ctx, model.TemplesTableName, sq.Eq{"id": req.Msg.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to get temple: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "temple not found")
	}

	pTemple, err := temple.ToProtobuf()
	if err != nil {
		return nil, fmt.Errorf("failed to convert temple to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetTempleResponse{Temple: pTemple}), nil
}

/* WORLD */
func (s *Server) GetWorld(ctx context.Context, req *connect.Request[serverv1.GetWorldRequest]) (*connect.Response[serverv1.GetWorldResponse], error) {
	world := model.GetWorld(ctx)

	pWorld, err := world.ToProtobuf(ctx, req.Msg.LoadFields)
	if err != nil {
		return nil, fmt.Errorf("failed to convert world to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetWorldResponse{World: pWorld}), nil
}

func (s *Server) IssueAttack(ctx context.Context, req *connect.Request[serverv1.IssueAttackRequest]) (*connect.Response[serverv1.IssueAttackResponse], error) {
	// TODO: Wrap in transaction
	// TODO: Use auth player
	villagesIds, err := model.GetPlayerVilageIds(ctx, 1)
	if err != nil {
		return nil, fmt.Errorf("failed to get player village ids: %w", err)
	}
	if !lo.Contains(villagesIds, req.Msg.VillageId) {
		return nil, status.Error(codes.PermissionDenied, "village does not belong to you")
	}

	village, found, err := model.GetVillage(ctx, req.Msg.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	var attackSize uint32
	var troopQuantity model.Troop_Quantity
	for pKind, quantity := range req.Msg.TroopQuantity {
		kind, err := model.Troop_KindFromProtobuf(pKind)
		if err != nil {
			return nil, fmt.Errorf("invalid troop kind %s: %w", pKind, err)
		}

		available := village.TroopQuantity.Get(kind)
		if quantity > available {
			return nil, status.Error(codes.InvalidArgument, "not enough troops")
		}

		troopQuantity.Increment(kind, quantity)
		attackSize += quantity
	}
	if attackSize == 0 {
		return nil, status.Error(codes.InvalidArgument, "no troops to attack")
	}

	// TODO: Check if coords inside the world
	targetCoords, err := model.CoordsFromProtobuf(req.Msg.TargetCoords)
	if err != nil {
		return nil, fmt.Errorf("invalid target coords: %w", err)
	}
	worldField, found, err := db.FindOne[model.WorldField](ctx, model.WorldFieldsTableName, sq.Eq{"coords": targetCoords})
	if err != nil {
		return nil, fmt.Errorf("failed to get world field: %w", err)
	}
	if !found {
		worldField := model.WorldField{
			Coords:     targetCoords,
			EntityKind: serverv1.World_Field_ENTITY_KIND_WILD,
		}
		_, err = db.Insert(ctx, model.WorldFieldsTableName, &worldField)
		if err != nil {
			return nil, fmt.Errorf("failed to create world field: %w", err)
		}
	}

	_, err = db.Insert(ctx, model.AttacksTableName, &model.Attack{
		TroopQuantity: troopQuantity,
		TimeLeft:      10, // TODO: Define time based on distance and troop types
		WorldFieldId:  worldField.Id,
		VillageId:     village.Id,
		PlayerId:      village.PlayerId,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create attack: %w", err)
	}

	// FUTURE: Move this to the loop above when this method is inside a transaction
	for kind, quantity := range troopQuantity.Iter() {
		village.TroopQuantity.Increment(kind, -quantity)
	}
	err = db.Update(ctx, model.VillagesTableName, village, sq.Eq{"id": village.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	return connect.NewResponse(&serverv1.IssueAttackResponse{}), nil
}

func (s *Server) CancelAttack(ctx context.Context, req *connect.Request[serverv1.CancelAttackRequest]) (*connect.Response[serverv1.CancelAttackResponse], error) {
	attack, err := db.First[model.Attack](ctx, sq.Select("*").From(model.AttacksTableName), sq.Eq{"id": req.Msg.Id, "player_id": 1}) // TODO: Use auth player
	if err != nil {
		return nil, fmt.Errorf("failed to get attack: %w", err)
	}

	village, err := attack.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village (id: %d): %w", attack.VillageId, err)
	}

	for kind, quantity := range attack.TroopQuantity.Iter() {
		village.TroopQuantity.Increment(kind, quantity)
	}
	err = db.Update(ctx, model.VillagesTableName, village, sq.Eq{"id": village.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to return troops to village: %w", err)
	}

	err = db.Delete(ctx, model.AttacksTableName, sq.Eq{"id": attack.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to delete attack: %w", err)
	}

	return connect.NewResponse(&serverv1.CancelAttackResponse{}), nil
}

func (s *Server) GetAttacks(ctx context.Context, req *connect.Request[serverv1.GetAttacksRequest]) (*connect.Response[serverv1.GetAttacksResponse], error) {
	outgoingAttacks, err := db.Find[model.Attack](ctx, sq.Select("*").From(model.AttacksTableName), sq.Eq{"player_id": 1}) // TODO: Use auth player
	if err != nil {
		return nil, fmt.Errorf("failed to get outgoing attacks: %w", err)
	}

	pOutgoingAttacks := []*serverv1.Attack{}
	for _, attack := range outgoingAttacks {
		pAttack, err := attack.ToProtobuf()
		if err != nil {
			return nil, fmt.Errorf("failed to convert attack (id: %d) to protobuf: %w", attack.Id, err)
		}
		pOutgoingAttacks = append(pOutgoingAttacks, pAttack)

	}

	return connect.NewResponse(&serverv1.GetAttacksResponse{
		OutgoingAttacks: pOutgoingAttacks,
	}), nil
}

/* PLAYERS */
func (s *Server) GetPlayer(ctx context.Context, req *connect.Request[serverv1.GetPlayerRequest]) (*connect.Response[serverv1.GetPlayerResponse], error) {
	id := req.Msg.Id.GetValue()
	if req.Msg.Id == nil {
		id = 1 // TODO: Get player from auth
	}

	player, found, err := model.GetPlayer(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get player: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "player not found")
	}

	pPlayer, err := player.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert player to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetPlayerResponse{Player: pPlayer}), nil
}

func main() {
	createDB := flag.Bool("db-create", false, "creates database")
	recreateDB := flag.Bool("db-recreate", false, "recreates database")
	seedDB := flag.Bool("db-seed", false, "seeds database")
	dbUri := flag.String("db-uri", "file:db.sqlite3", "database uri")
	flag.Parse()

	err := db.Init(*dbUri)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	if *recreateDB {
		err := DropDB()
		if err != nil {
			log.Fatalf("failed to drop database: %v", err)
		}
	}

	if *recreateDB || *createDB {
		err := CreateDB()
		if err != nil {
			log.Fatalf("failed to create database: %v", err)
		}
	}

	if *seedDB {
		err := SeedDB()
		if err != nil {
			log.Fatalf("failed to seed database: %v", err)
		}
	}

	go runServer()

	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		ctx := context.Background()

		attacks, err := db.Find[model.Attack](ctx, sq.Select("*").From(model.AttacksTableName))
		if err != nil {
			log.Printf("failed to get attacks: %v", err)
			continue
		}
		for _, attack := range attacks {
			attack.TimeLeft--
			if attack.TimeLeft == 0 {
				err := db.Delete(ctx, model.AttacksTableName, sq.Eq{"id": attack.Id})
				if err != nil {
					log.Printf("failed to delete attack (id: %d): %v", attack.Id, err)
					continue
				}

				worldField, err := attack.WorldField(ctx)
				if err != nil {
					log.Printf("failed to get attack (id: %d) world field: %v", attack.Id, err)
					continue
				}
				switch worldField.EntityKind {
				case serverv1.World_Field_ENTITY_KIND_WILD:
					village := model.NewVillage(attack.PlayerId)
					_, err = db.Insert(ctx, model.VillagesTableName, &village)
					if err != nil {
						log.Printf("failed to create new village: %v", err)
						continue
					}

					err = db.Update(ctx, model.WorldFieldsTableName,
						map[string]any{
							"entity_kind": serverv1.World_Field_ENTITY_KIND_VILLAGE,
							"entity_id":   village.Id,
						},
						sq.Eq{"id": worldField.Id},
					)
					if err != nil {
						log.Printf("failed to convert world field (id: %d) from wild to village: %v", worldField.Id, err)
						continue
					}

				case serverv1.World_Field_ENTITY_KIND_VILLAGE:
					targetVillage, err := db.First[model.Village](ctx, sq.Select("*").From(model.VillagesTableName), sq.Eq{"id": worldField.EntityId})
					if err != nil {
						log.Printf("failed to find target village (id: %d): %v", worldField.EntityId, err)
						continue
					}
					if targetVillage.PlayerId == attack.VillageId {
						// TODO: Add attack troop quantity to target village
					} else {
						// TODO: Combat

						var hasLeader bool
						for kind, quantity := range attack.TroopQuantity.Iter() {
							if kind == model.Troop_Kind_LEADER && quantity > 0 {
								hasLeader = true
								break
							}
						}
						if hasLeader {
							targetVillage.PlayerId = attack.PlayerId
							err = db.Update(ctx, model.VillagesTableName, targetVillage, sq.Eq{"id": targetVillage.Id})
							if err != nil {
								log.Printf("failed to update village (id: %d) owner: %v", targetVillage.Id, err)
								continue
							}
						}
					}

				case serverv1.World_Field_ENTITY_KIND_TEMPLE:
					log.Printf("don't know how to attack temple") // TODO: Rethink this
				}
			} else {
				err := db.Update(ctx, model.AttacksTableName, attack, sq.Eq{"id": attack.Id})
				if err != nil {
					log.Printf("failed to update attack (id: %d): %v", attack.Id, err)
					continue
				}
			}
		}

		villages, err := model.GetVillages(ctx)
		if err != nil {
			log.Printf("failed to get villages: %v", err)
			continue
		}
		for _, village := range villages {
			// TODO: Wrap in transaction
			/* BUILDINGS */
			buildingUpgradeOrders, err := village.BuildingUpgradeOrders(ctx)
			if err != nil {
				log.Printf("failed to get building upgrade orders (village_id: %d): %v", village.Id, err)
				continue
			}
			for _, order := range buildingUpgradeOrders {
				order.TimeLeft--
				if order.TimeLeft == 0 {
					err := model.DeleteBuildingUpgradeOrder(ctx, order.Id)
					if err != nil {
						log.Printf("failed to delete building upgrade order (id: %d): %v", order.Id, err)
						continue
					}
					village.BuildingLevel.Increment(order.BuildingKind)
				} else {
					err := model.UpdateBuildingUpgradeOrder(ctx, order.Id, order)
					if err != nil {
						log.Printf("failed to update building training order (id: %d): %v", order.Id, err)
						continue
					}
				}
			}

			/* TROOPS */
			troopTrainingOrders, err := village.TroopTrainingOrders(ctx)
			if err != nil {
				log.Printf("failed to get troop training orders (village_id: %d): %v", village.Id, err)
				continue
			}
			for _, order := range troopTrainingOrders {
				order.TimeLeft--
				if order.TimeLeft == 0 {
					err := model.DeleteTroopTrainingOrder(ctx, order.Id)
					if err != nil {
						log.Printf("failed to delete troop training order (id: %d): %v", order.Id, err)
						continue
					}
					village.TroopQuantity.Increment(order.TroopKind, order.Quantity)
				} else {
					err := model.UpdateTroopTrainingOrder(ctx, order.Id, order)
					if err != nil {
						log.Printf("failed to update troop training order (id: %d): %v", order.Id, err)
						continue
					}
				}
			}

			village.Gold++
			err = model.UpdateVillage(ctx, village.Id, village)
			if err != nil {
				log.Printf("failed to update village (id: %d): %v", village.Id, err)
				continue
			}
		}
	}
}

func GRPCStatusCodeToConnectStatusCodeInterceptor() connect.UnaryInterceptorFunc {
	return connect.UnaryInterceptorFunc(func(next connect.UnaryFunc) connect.UnaryFunc {
		return connect.UnaryFunc(func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			res, err := next(ctx, req)
			if code := status.Code(err); code != codes.OK {
				return nil, connect.NewError(connect.Code(code), err)
			}
			return res, err
		})
	})
}

func ValidationInterceptor(validator *protovalidate.Validator) connect.UnaryInterceptorFunc {
	return connect.UnaryInterceptorFunc(func(next connect.UnaryFunc) connect.UnaryFunc {
		return connect.UnaryFunc(func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			err := validator.Validate(req.Any().(protoreflect.ProtoMessage))
			if err != nil {
				if vErr, ok := err.(*protovalidate.ValidationError); ok {
					connectErr := connect.NewError(connect.Code(connect.CodeInvalidArgument), errors.New("validation error"))
					detail, err := connect.NewErrorDetail(vErr.ToProto())
					if err != nil {
						return nil, err
					}
					connectErr.AddDetail(detail)
					return nil, connectErr
				}
				return nil, err
			}
			return next(ctx, req)
		})
	})
}

func runServer() {
	server := gin.Default()
	server.SetTrustedProxies(nil)
	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4000"},
		AllowMethods:     []string{"POST"},
		AllowHeaders:     []string{"Origin", "Connect-Protocol-Version", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	validator, err := protovalidate.New()
	if err != nil {
		log.Fatalf("failed to create proto validator: %v", err)
	}

	path, handler := serverv1connect.NewServiceHandler(
		&Server{},
		connect.WithInterceptors(
			ValidationInterceptor(validator),
			GRPCStatusCodeToConnectStatusCodeInterceptor(),
		),
	)
	server.Any(fmt.Sprintf("%s*w", path), gin.WrapH(handler))
	if err = server.Run(":3000"); err != nil {
		log.Fatalf("failed run server: %v", err)
	}
}

func CreateDB() error {
	_, err := db.DB.Exec(`
		CREATE TABLE players (
			id INTEGER PRIMARY KEY
		);

		CREATE TABLE villages (
			id INTEGER PRIMARY KEY,
			gold UNSIGNED INTERGER NOT NULL,
			building_level TEXT NOT NULL,
			troop_quantity TEXT NOT NULL,

			player_id INTEGER NOT NULL,
			FOREIGN KEY(player_id) REFERENCES players(id)
		);

		CREATE TABLE building_upgrade_orders (
			id INTEGER PRIMARY KEY,
			level UNSIGNED INTEGER NOT NULL,
			time_left UNSIGNED INTEGER NOT NULL,
			building_kind VARCHAR(255) NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE troop_training_orders (
			id INTEGER PRIMARY KEY,
			quantity UNSIGNED INTEGER NOT NULL,
			time_left UNSIGNED INTEGER NOT NULL,
			troop_kind VARCHAR(255) NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE world_fields (
			id INTEGER PRIMARY KEY,
			coords VARCHAR(255) NOT NULL,
			entity_kind INTERGER NOT NULL,
			entity_id INTEGER NOT NULL
		);

		CREATE TABLE temples (
			id INTEGER PRIMARY KEY,
			gold UNSIGNED INTEGER NOT NULL
		);

		CREATE TABLE attacks (
			id INTEGER PRIMARY KEY,
			troop_quantity TEXT NOT NULL,
			time_left UNSIGNED INTEGER NOT NULL,

			world_field_id INTEGER NOT NULL,
			village_id INTEGER NOT NULL,
			player_id INTEGER NOT NULL,
			FOREIGN KEY(world_field_id) REFERENCES world_fields(id),
			FOREIGN KEY(village_id) REFERENCES villages(id),
			FOREIGN KEY(player_id) REFERENCES players(id)
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	return nil
}

func SeedDB() error {
	_, err := model.CreatePlayer(context.Background(), model.Coords{X: 3, Y: 4})
	if err != nil {
		return fmt.Errorf("failed to create player 1: %w", err)
	}
	_, err = model.CreatePlayer(context.Background(), model.Coords{X: 6, Y: 5})
	if err != nil {
		return fmt.Errorf("failed to create player 2: %w", err)
	}
	_, err = model.CreateTemple(context.Background(), model.Coords{X: 1, Y: 1})
	if err != nil {
		return fmt.Errorf("failed to create temple (1,1): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), model.Coords{X: 8, Y: 1})
	if err != nil {
		return fmt.Errorf("failed to create temple (8,1): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), model.Coords{X: 8, Y: 8})
	if err != nil {
		return fmt.Errorf("failed to create temple (8,8): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), model.Coords{X: 1, Y: 8})
	if err != nil {
		return fmt.Errorf("failed to create temple (1,8): %w", err)
	}
	return nil
}

func DropDB() error {
	_, err := db.DB.Exec(`
		DROP TABLE attacks;
		DROP TABLE troop_training_orders;
		DROP TABLE building_upgrade_orders;
		DROP TABLE villages;
		DROP TABLE temples;
		DROP TABLE world_fields;
		DROP TABLE players;
	`)
	return err
}
