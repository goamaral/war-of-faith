package db

import (
	"context"

	sq "github.com/Masterminds/squirrel"
)

const TroopTrainingOrdersTableName = "troop_training_orders"

func CreateTroopTrainingOrder(ctx context.Context, order *TroopTrainingOrder) (*TroopTrainingOrder, error) {
	return order, insertQuery(ctx, TroopTrainingOrdersTableName, order)
}

func GetTroopTrainingOrder(ctx context.Context, id uint32) (TroopTrainingOrder, bool, error) {
	return firstQuery[TroopTrainingOrder](ctx, TroopTrainingOrdersTableName, sq.Eq{"id": id})
}

func GetTroopTrainingOrders(ctx context.Context, opts ...QueryOption) ([]TroopTrainingOrder, error) {
	return findQuery[TroopTrainingOrder](ctx, TroopTrainingOrdersTableName, opts...)
}

func UpdateTroopTrainingOrder(ctx context.Context, id uint32, order TroopTrainingOrder) error {
	return updateQuery(ctx, TroopTrainingOrdersTableName, order, sq.Eq{"id": id})
}

func DeleteTroopTrainingOrder(ctx context.Context, id uint32) error {
	return deleteQuery(ctx, TroopTrainingOrdersTableName, sq.Eq{"id": id})
}
