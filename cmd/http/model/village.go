package model

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

type Village struct {
	Id uint32 `db:"id"`

	Gold          uint32         `db:"gold"`
	TroopQuantity Troop_Quantity `db:"troop_quantity"`

	PlayerId uint32 `db:"player_id"`

	buildings           *[]Building
	troopTrainingOrders *[]TroopTrainingOrder
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

// Associations
func (v *Village) Buildings(ctx context.Context) ([]Building, error) {
	if v.buildings == nil {
		buildings, err := GetBuildings(ctx, sq.Eq{"village_id": v.Id})
		if err != nil {
			return nil, err
		}
		v.buildings = &buildings
	}
	return *v.buildings, nil
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
	buildings, err := v.Buildings(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get buildings: %w", err)
	}
	pBuildings := make([]*serverv1.Building, len(buildings))
	for i, b := range buildings {
		pBuildings[i], err = b.ToProtobuf(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to convert building to protobuf: %w", err)
		}
	}

	buildingUpgradeOrders, err := GetBuildingUpgradeOrders(ctx, sq.Eq{"village_id": v.Id})
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

	troopTrainingOrders, err := GetTroopTrainingOrders(ctx, sq.Eq{"village_id": v.Id})
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
		Buildings:             pBuildings,
		BuildingUpgradeOrders: pBuildingUpgradeOrders,
		TroopQuantity:         v.TroopQuantity.ToProtobuf(),
		TroopTrainingOrders:   pTroopTrainingOrders,
	}, nil
}
