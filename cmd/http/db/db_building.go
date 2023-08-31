package db

import (
	"context"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const BuildingsTableName = "buildings"

func CreateBuilding(ctx context.Context, kind serverv1.Building_Kind, villageId uint32) (Building, error) {
	building := Building{Kind: kind, Level: 1, VillageId: villageId}
	return building, insertQuery(ctx, BuildingsTableName, &building)
}

func GetBuilding(ctx context.Context, id uint32) (Building, bool, error) {
	return firstQuery[Building](ctx, BuildingsTableName, sq.Eq{"id": id})
}

func GetBuildings(ctx context.Context, opts ...QueryOption) ([]Building, error) {
	return findQuery[Building](ctx, BuildingsTableName, opts...)
}

func UpdateBuilding(ctx context.Context, id uint32, building Building) error {
	return updateQuery(ctx, BuildingsTableName, building, sq.Eq{"id": id})
}
