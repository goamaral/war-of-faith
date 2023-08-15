package db

import (
	"context"
	"math/rand"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)

func CreateBuilding(ctx context.Context, kind serverv1.Building_Kind, villageId uint32) (Building, error) {
	building := Building{Id: rand.Uint32(), Kind: kind, Level: 1, VillageId: villageId} // TODO: Improve id generation
	id, err := insertQuery(ctx, goqu.Insert("buildings").Rows(building))
	if err != nil {
		return Building{}, err
	}
	building.Id = uint32(id)
	return building, nil
}

func GetBuilding(ctx context.Context, exprs ...exp.Expression) (Building, bool, error) {
	return firstQuery[Building](ctx, dialect.From("buildings").Where(exprs...))
}

func GetBuildings(ctx context.Context, exprs ...exp.Expression) ([]Building, error) {
	buildings, err := findQuery[Building](ctx, dialect.From("buildings").Where(exprs...))
	if err != nil {
		return nil, err
	}
	return buildings, nil
}

func UpdateBuilding(ctx context.Context, id uint32, building Building) error {
	_, err := updateQuery(ctx, dialect.Update("buildings").Where(exp.Ex{"id": id}).Set(building))
	return err
}
