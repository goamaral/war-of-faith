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
		return order, err
	}
	return order, nil
}

func GetTroopTrainingOrders(ctx context.Context, exprs ...exp.Expression) ([]TroopTrainingOrder, error) {
	orders, err := findQuery[TroopTrainingOrder](ctx, dialect.From(TroopTrainingOrdersTableName).Where(exprs...))
	if err != nil {
		return nil, err
	}
	return orders, nil
}

func UpdateTroopTrainingOrder(ctx context.Context, id uint32, order TroopTrainingOrder) error {
	_, err := updateQuery(ctx, dialect.Update(TroopTrainingOrdersTableName).Where(exp.Ex{"id": id}).Set(order))
	return err
}

func DeleteTroopTrainingOrder(ctx context.Context, exprs ...exp.Expression) error {
	_, err := deleteQuery(ctx, dialect.From(TroopTrainingOrdersTableName).Where(exprs...))
	return err
}
