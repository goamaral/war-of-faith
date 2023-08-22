package db

import (
	"context"

	sq "github.com/Masterminds/squirrel"
)

const TroopsTableName = "troops"

func CreateTroop(ctx context.Context, troop *Troop) (*Troop, error) {
	return troop, insertQuery(ctx, TroopsTableName, troop)
}

func GetTroop(ctx context.Context, id uint32) (Troop, bool, error) {
	return firstQuery[Troop](ctx, TroopsTableName, sq.Eq{"id": id})
}

func GetTroops(ctx context.Context, exprs ...QryExp) ([]Troop, error) {
	return findQuery[Troop](ctx, TroopsTableName, exprs...)
}

func UpdateTroop(ctx context.Context, id uint32, troop Troop) error {
	return updateQuery(ctx, TroopsTableName, troop, sq.Eq{"id": id})
}
