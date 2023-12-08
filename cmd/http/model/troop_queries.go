package model

import (
	"context"
	"war-of-faith/cmd/http/db"

	sq "github.com/Masterminds/squirrel"
)

const TroopsTableName = "troops"

func CreateTroop(ctx context.Context, troop *Troop) (*Troop, error) {
	return troop, db.Insert(ctx, TroopsTableName, troop)
}

func GetTroop(ctx context.Context, opts ...db.QueryOption) (Troop, bool, error) {
	return db.FindOne[Troop](ctx, TroopsTableName, opts...)
}

func GetTroops(ctx context.Context, opts ...db.QueryOption) ([]Troop, error) {
	return db.Find[Troop](ctx, TroopsTableName, opts...)
}

func UpdateTroop(ctx context.Context, id uint32, troop Troop) error {
	return db.Update(ctx, TroopsTableName, troop, sq.Eq{"id": id})
}
