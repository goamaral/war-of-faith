package model

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

// TODO: Define building upgrade costs
const PlaceholderBuildingMaxLevel = 10

// TODO: Define building upgrade costs
// TODO: Apply hall bonus
func CalculateBuildingUpgradeCost(level uint32) Resources {
	return Resources{Time: 10, Gold: 10}
}

type Building struct {
	Id    uint32                 `db:"id"`
	Kind  serverv1.Building_Kind `db:"kind"`
	Level uint32                 `db:"level"`

	VillageId     uint32 `db:"village_id"`
	village       *Village
	upgradeOrders *[]BuildingUpgradeOrder
}

func (b Building) ToProtobuf(ctx context.Context) (*serverv1.Building, error) {
	return &serverv1.Building{
		Id:    b.Id,
		Kind:  b.Kind,
		Name:  b.Name(),
		Level: b.Level,
	}, nil
}

func (b *Building) Village(ctx context.Context) (Village, error) {
	if b.village == nil {
		village, found, err := GetVillage(ctx, b.VillageId)
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, db.ErrNotFound
		}
		b.village = &village
	}
	return *b.village, nil
}

func (b Building) Name() string {
	switch b.Kind {
	case serverv1.Building_KIND_HALL:
		return "Village Hall"
	case serverv1.Building_KIND_GOLD_MINE:
		return "Gold Mine"
	default:
		return "Unknown"
	}
}

func (b *Building) UpgradeOrders(ctx context.Context) ([]BuildingUpgradeOrder, error) {
	if b.upgradeOrders == nil {
		upgradeOrders, err := GetBuildingUpgradeOrders(ctx, sq.Eq{"building_id": b.Id})
		if err != nil {
			return nil, err
		}
		b.upgradeOrders = &upgradeOrders
	}
	return *b.upgradeOrders, nil
}

func (b *Building) NextUpgradeLevel(ctx context.Context) (uint32, error) {
	upgradeOrders, err := b.UpgradeOrders(ctx)
	if err != nil {
		return 0, fmt.Errorf("failed to get building (id: %d) upgrade orders: %w", b.Id, err)
	}
	return b.Level + uint32(len(upgradeOrders)) + 1, nil
}
