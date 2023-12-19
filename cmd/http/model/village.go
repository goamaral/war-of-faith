package model

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

type Village struct {
	Id uint32 `db:"id"`

	Gold          uint32         `db:"gold"`
	BuildingLevel Building_Level `db:"building_level"`
	TroopQuantity Troop_Quantity `db:"troop_quantity"`

	PlayerId uint32 `db:"player_id"`

	buildingUpgradeOrders *[]BuildingUpgradeOrder
	troopTrainingOrders   *[]TroopTrainingOrder
}

func NewVillage(playerId uint32) Village {
	return Village{
		BuildingLevel: Building_Level{
			JsonMap: db.JsonMap[Building_Kind, uint32]{
				Building_Kind_HALL:      1,
				Building_Kind_GOLD_MINE: 1,
			},
		},
		TroopQuantity: Troop_Quantity{
			JsonMap: db.JsonMap[Troop_Kind, uint32]{
				Troop_Kind_LEADER: 0,
			},
		},
		PlayerId: playerId,
	}
}

func (v Village) CanAfford(resources Resources) bool {
	return v.Gold >= resources.Gold
}

func (v *Village) SpendResources(resources Resources) {
	v.Gold -= resources.Gold
}

func (v *Village) EarnResources(resources Resources) {
	v.Gold += resources.Gold
}

func (v *Village) NextBuildingUpgradeLevel(ctx context.Context, kind Building_Kind) (uint32, error) {
	upgradeOrders, err := GetBuildingUpgradeOrders(ctx, sq.Eq{"village_id": v.Id, "building_kind": kind})
	if err != nil {
		return 0, fmt.Errorf("failed to get building upgrade orders: %w", err)
	}
	return v.BuildingLevel.Get(kind) + uint32(len(upgradeOrders)) + 1, nil
}

// Associations
func (v *Village) BuildingUpgradeOrders(ctx context.Context) ([]BuildingUpgradeOrder, error) {
	if v.buildingUpgradeOrders == nil {
		orders, err := GetBuildingUpgradeOrders(ctx, sq.Eq{"village_id": v.Id})
		if err != nil {
			return nil, err
		}
		v.buildingUpgradeOrders = &orders
	}
	return *v.buildingUpgradeOrders, nil
}

func (v *Village) TroopTrainingOrders(ctx context.Context) ([]TroopTrainingOrder, error) {
	if v.troopTrainingOrders == nil {
		orders, err := GetTroopTrainingOrders(ctx, sq.Eq{"village_id": v.Id})
		if err != nil {
			return nil, err
		}
		v.troopTrainingOrders = &orders
	}
	return *v.troopTrainingOrders, nil
}

/* PROTOBUF */
func (v *Village) ToProtobuf(ctx context.Context) (*serverv1.Village, error) {
	buildingUpgradeOrders, err := v.BuildingUpgradeOrders(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village building upgrade orders: %w", err)
	}
	pBuildingUpgradeOrders := make([]*serverv1.Building_UpgradeOrder, len(buildingUpgradeOrders))
	for i, t := range buildingUpgradeOrders {
		pBuildingUpgradeOrders[i], err = t.ToProtobuf(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to convert village building upgrade order to protobuf: %w", err)
		}
	}

	troopTrainingOrders, err := v.TroopTrainingOrders(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village troop training orders: %w", err)
	}
	pTroopTrainingOrders := make([]*serverv1.Troop_TrainingOrder, len(troopTrainingOrders))
	for i, t := range troopTrainingOrders {
		pTroopTrainingOrders[i], err = t.ToProtobuf(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to convert village troop training order to protobuf: %w", err)
		}
	}

	return &serverv1.Village{
		Id: v.Id,
		Resources: &serverv1.Resources{
			Gold: v.Gold,
		},
		BuildingLevel:         v.BuildingLevel.ToProtobuf(),
		BuildingUpgradeOrders: pBuildingUpgradeOrders,
		TroopQuantity:         v.TroopQuantity.ToProtobuf(),
		TroopTrainingOrders:   pTroopTrainingOrders,
	}, nil
}
