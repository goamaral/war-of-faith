package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const BuildingsTableName = "buildings"

func CreateBuilding(ctx context.Context, kind serverv1.Building_Kind, villageId uint32) (Building, error) {
	building := Building{Kind: kind, Level: 1, VillageId: villageId}
	return building, db.Insert(ctx, BuildingsTableName, &building)
}

func GetBuilding(ctx context.Context, id uint32) (Building, bool, error) {
	return db.FindOne[Building](ctx, BuildingsTableName, sq.Eq{"id": id})
}

func GetBuildings(ctx context.Context, opts ...db.QueryOption) ([]Building, error) {
	return db.Find[Building](ctx, BuildingsTableName, opts...)
}

func UpdateBuilding(ctx context.Context, id uint32, building Building) error {
	return db.Update(ctx, BuildingsTableName, building, sq.Eq{"id": id})
}
