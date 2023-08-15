package db

import (
	"context"
	"math/rand"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)

func CreateTroop(ctx context.Context, troop *Troop) (*Troop, error) {
	troop.Id = rand.Uint32()
	_, err := insertQuery(ctx, goqu.Insert("troops").Rows(troop))
	if err != nil {
		return troop, err
	}
	return troop, nil
}

func GetTroop(ctx context.Context, exprs ...exp.Expression) (Troop, bool, error) {
	return firstQuery[Troop](ctx, dialect.From("troops").Where(exprs...))
}

func GetTroops(ctx context.Context, exprs ...exp.Expression) ([]Troop, error) {
	troops, err := findQuery[Troop](ctx, dialect.From("troops").Where(exprs...))
	if err != nil {
		return nil, err
	}
	return troops, nil
}
