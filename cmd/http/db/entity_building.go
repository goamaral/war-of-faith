package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9/exp"
)

const BuildingMaxLevel = 10

var BuildingUpgradeCost = Resources{
	Time: 10,
	Gold: 10,
}

type Building struct {
	Id    uint32                 `db:"id"`
	Kind  serverv1.Building_Kind `db:"kind"`
	Level uint32                 `db:"level"`

	UpgradeTimeLeft uint32 `db:"upgrade_time_left"`

	VillageId uint32 `db:"village_id"`

	village *Village
}

func (b *Building) ToProtobuf(ctx context.Context) (*serverv1.Building, error) {
	upgradeStatus, err := b.UpgradeStatus(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check building status: %w", err)
	}

	return &serverv1.Building{
		Id:              b.Id,
		Kind:            b.Kind,
		Name:            b.Name(),
		Level:           b.Level,
		UpgradeStatus:   upgradeStatus,
		UpgradeTimeLeft: b.UpgradeTimeLeft,
		UpgradeCost:     BuildingUpgradeCost.ToProtobuf(),
	}, nil
}

func (b *Building) Village(ctx context.Context) (Village, error) {
	if b.village == nil {
		village, found, err := GetVillage(ctx, exp.Ex{"id": b.VillageId})
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, fmt.Errorf("village not found")
		}
		b.village = &village
	}
	return *b.village, nil
}

func (b *Building) UpgradeStatus(ctx context.Context) (serverv1.Building_UpgradeStatus, error) {
	if b.UpgradeTimeLeft > 0 {
		return serverv1.Building_UPGRADE_STATUS_UPGRADING, nil
	}

	if b.Level >= BuildingMaxLevel {
		return serverv1.Building_UPGRADE_STATUS_MAX_LEVEL, nil
	}

	village, err := b.Village(ctx)
	if err != nil {
		return serverv1.Building_UPGRADE_STATUS_UNSPECIFIED, fmt.Errorf("failed to get village: %w", err)
	}

	if BuildingUpgradeCost.Gold > village.Gold {
		return serverv1.Building_UPGRADE_STATUS_INSUFFICIENT_RESOURCES, nil
	}

	return serverv1.Building_UPGRADE_STATUS_UPGRADABLE, nil
}

func (b *Building) Name() string {
	switch b.Kind {
	case serverv1.Building_KIND_HALL:
		return "Village Hall"
	case serverv1.Building_KIND_GOLD_MINE:
		return "Gold Mine"
	default:
		return "Unknown"
	}
}
