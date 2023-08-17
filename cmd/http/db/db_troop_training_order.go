package db

import (
	"context"
	"math/rand"

	"github.com/doug-martin/goqu/v9"
	"github.com/doug-martin/goqu/v9/exp"
)

const TroopTrainingOrdersTableName = "troop_training_orders"

func CreateTroopTrainingOrder(ctx context.Context, order *TroopTrainingOrder) (*TroopTrainingOrder, error) {
	order.Id = rand.Uint32()
	_, err := insertQuery(ctx, goqu.Insert(TroopTrainingOrdersTableName).Rows(order))
	if err != nil {
		order.Id = 0
		return order, err
	}
	return order, err
}

func GetTroopTrainingOrder(ctx context.Context, exprs ...exp.Expression) (TroopTrainingOrder, bool, error) {
	return firstQuery[TroopTrainingOrder](ctx, dialect.From(TroopTrainingOrdersTableName).Where(exprs...))
}

func GetTroopTrainingOrders(ctx context.Context, exprs ...exp.Expression) ([]TroopTrainingOrder, error) {
	return findQuery[TroopTrainingOrder](ctx, dialect.From(TroopTrainingOrdersTableName).Where(exprs...))
}

func UpdateTroopTrainingOrder(ctx context.Context, id uint32, order TroopTrainingOrder) error {
	_, err := updateQuery(ctx, dialect.Update(TroopTrainingOrdersTableName).Where(exp.Ex{"id": id}).Set(order))
	return err
}

func DeleteTroopTrainingOrder(ctx context.Context, exprs ...exp.Expression) error {
	_, err := deleteQuery(ctx, dialect.From(TroopTrainingOrdersTableName).Where(exprs...))
	return err
}
