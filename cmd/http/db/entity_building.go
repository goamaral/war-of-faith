package db

import (
	"context"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

// TODO: Define building upgrade costs
const PlaceholderBuildingMaxLevel = 10

// TODO: Define building upgrade costs
// TODO: Apply hall bonus
func CalculateBuildingUpgradeCost() Resources {
	return Resources{Time: 10, Gold: 10}
}

type Building struct {
	Id    uint32                 `db:"id"`
	Kind  serverv1.Building_Kind `db:"kind"`
	Level uint32                 `db:"level"`

	UpgradeTimeLeft uint32 `db:"upgrade_time_left"`

	VillageId uint32 `db:"village_id"`

	village *Village
}

func (b Building) ToProtobuf(ctx context.Context) (*serverv1.Building, error) {
	return &serverv1.Building{
		Id:              b.Id,
		Kind:            b.Kind,
		Name:            b.Name(),
		Level:           b.Level,
		UpgradeTimeLeft: b.UpgradeTimeLeft,
	}, nil
}

func (b *Building) Village(ctx context.Context) (Village, error) {
	if b.village == nil {
		village, found, err := GetVillage(ctx, b.VillageId)
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, ErrNotFound
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
