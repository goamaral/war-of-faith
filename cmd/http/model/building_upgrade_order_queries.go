package model

import (
	"context"
	"war-of-faith/cmd/http/db"

	sq "github.com/Masterminds/squirrel"
)

const BuildingUpgradeOrdersTableName = "building_upgrade_orders"

func CreateBuildingUpgradeOrder(ctx context.Context, order *BuildingUpgradeOrder) (*BuildingUpgradeOrder, error) {
	return order, db.Insert(ctx, BuildingUpgradeOrdersTableName, order)
}

func GetBuildingUpgradeOrder(ctx context.Context, id uint32) (BuildingUpgradeOrder, bool, error) {
	return db.FindOne[BuildingUpgradeOrder](ctx, BuildingUpgradeOrdersTableName, sq.Eq{"id": id})
}

func GetBuildingUpgradeOrders(ctx context.Context, opts ...db.QueryOption) ([]BuildingUpgradeOrder, error) {
	return db.Find[BuildingUpgradeOrder](ctx, BuildingUpgradeOrdersTableName, opts...)
}

func UpdateBuildingUpgradeOrder(ctx context.Context, id uint32, order BuildingUpgradeOrder) error {
	return db.Update(ctx, BuildingUpgradeOrdersTableName, order, sq.Eq{"id": id})
}

func DeleteBuildingUpgradeOrder(ctx context.Context, id uint32) error {
	return db.Delete(ctx, BuildingUpgradeOrdersTableName, sq.Eq{"id": id})
}
