package db

import (
	"context"
	"fmt"
	"math/rand"

	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)

func CreateVillage(ctx context.Context) (Village, error) {
	village := Village{Id: rand.Uint32(), buildings: &[]Building{}}
	id, err := insertQuery(ctx, goqu.Insert("villages").Rows(village))
	if err != nil {
		return Village{}, err
	}
	village.Id = uint32(id)

	v, found, err := GetVillage(ctx, exp.Ex{"id": village.Id})
	if err != nil {
		return Village{}, err
	}
	fmt.Println("V", found, v)

	// Hall
	hall, err := CreateBuilding(ctx, serverv1.Building_KIND_HALL, village.Id)
	if err != nil {
		return Village{}, fmt.Errorf("failed to create hall building: %w", err)
	}
	*village.buildings = append(*village.buildings, hall)

	// Gold mine
	goldMine, err := CreateBuilding(ctx, serverv1.Building_KIND_GOLD_MINE, village.Id)
	if err != nil {
		return Village{}, fmt.Errorf("failed to create gold mine building: %w", err)
	}
	*village.buildings = append(*village.buildings, goldMine)

	return village, nil
}

func GetVillages(ctx context.Context, exprs ...exp.Expression) ([]Village, error) {
	return findQuery[Village](ctx, dialect.From("villages").Where(exprs...))
}

func GetVillage(ctx context.Context, exprs ...exp.Expression) (Village, bool, error) {
	return firstQuery[Village](ctx, dialect.From("villages").Where(exprs...))
}

func UpdateVillage(ctx context.Context, id uint32, village Village) error {
	_, err := updateQuery(ctx, dialect.Update("villages").Where(exp.Ex{"id": id}).Set(village))
	return err
}
