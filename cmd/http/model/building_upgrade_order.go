package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type BuildingUpgradeOrder struct {
	Id       uint32 `db:"id"`
	Level    uint32 `db:"level"`
	TimeLeft uint32 `db:"time_left"`

	BuildingId uint32 `db:"building_id"` // TODO: Use Building.Kind instead
	building   *Building
	VillageId  uint32 `db:"village_id"` // TODO: Remove when joins are implemented
}

func (o *BuildingUpgradeOrder) ToProtobuf(ctx context.Context) (*serverv1.Building_UpgradeOrder, error) {
	return &serverv1.Building_UpgradeOrder{
		Id:         o.Id,
		Level:      o.Level,
		TimeLeft:   o.TimeLeft,
		Cost:       CalculateBuildingUpgradeCost(o.Level).ToProtobuf(),
		BuildingId: o.BuildingId,
	}, nil
}

func (o *BuildingUpgradeOrder) Building(ctx context.Context) (Building, error) {
	if o.building == nil {
		building, found, err := GetBuilding(ctx, o.BuildingId)
		if err != nil {
			return Building{}, err
		}
		if !found {
			return Building{}, db.ErrNotFound
		}
		o.building = &building
	}
	return *o.building, nil
}
