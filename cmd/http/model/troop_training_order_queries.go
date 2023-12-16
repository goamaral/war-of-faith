package model

import (
	"context"
	"war-of-faith/cmd/http/db"

	sq "github.com/Masterminds/squirrel"
)

const TroopTrainingOrdersTableName = "troop_training_orders"

func CreateTroopTrainingOrder(ctx context.Context, order *TroopTrainingOrder) (*TroopTrainingOrder, error) {
	return order, db.Insert(ctx, TroopTrainingOrdersTableName, order)
}

func GetTroopTrainingOrder(ctx context.Context, id uint32) (TroopTrainingOrder, bool, error) {
	return db.FindOne[TroopTrainingOrder](ctx, TroopTrainingOrdersTableName, sq.Eq{"id": id})
}

func GetTroopTrainingOrders(ctx context.Context, opts ...db.QueryOption) ([]TroopTrainingOrder, error) {
	return db.Find[TroopTrainingOrder](ctx, sq.Select("*").From(TroopTrainingOrdersTableName), opts...)
}

func UpdateTroopTrainingOrder(ctx context.Context, id uint32, order TroopTrainingOrder) error {
	return db.Update(ctx, TroopTrainingOrdersTableName, order, sq.Eq{"id": id})
}

func DeleteTroopTrainingOrder(ctx context.Context, id uint32) error {
	return db.Delete(ctx, TroopTrainingOrdersTableName, sq.Eq{"id": id})
}
