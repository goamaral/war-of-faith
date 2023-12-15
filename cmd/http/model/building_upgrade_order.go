package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type BuildingUpgradeOrder struct {
	Id           uint32        `db:"id"`
	Level        uint32        `db:"level"`
	TimeLeft     uint32        `db:"time_left"`
	BuildingKind Building_Kind `db:"building_kind"`

	VillageId uint32 `db:"village_id"`
	village   *Village
}

func (o *BuildingUpgradeOrder) ToProtobuf(ctx context.Context) (*serverv1.Building_UpgradeOrder, error) {
	return &serverv1.Building_UpgradeOrder{
		Id:           o.Id,
		Level:        o.Level,
		TimeLeft:     o.TimeLeft,
		Cost:         o.BuildingKind.CalculateUpgradeCost(0, 0).ToProtobuf(), // TODO: Pass hall level
		BuildingKind: o.BuildingKind.String(),
	}, nil
}

func (o *BuildingUpgradeOrder) Village(ctx context.Context) (Village, error) {
	if o.village == nil {
		village, found, err := GetVillage(ctx, o.VillageId)
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, db.ErrNotFound
		}
		o.village = &village
	}
	return *o.village, nil
}
