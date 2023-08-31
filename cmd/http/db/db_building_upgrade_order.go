package db

import (
	"context"

	sq "github.com/Masterminds/squirrel"
)

const BuildingUpgradeOrdersTableName = "building_upgrade_orders"

func CreateBuildingUpgradeOrder(ctx context.Context, order *BuildingUpgradeOrder) (*BuildingUpgradeOrder, error) {
	return order, insertQuery(ctx, BuildingUpgradeOrdersTableName, order)
}

func GetBuildingUpgradeOrder(ctx context.Context, id uint32) (BuildingUpgradeOrder, bool, error) {
	return firstQuery[BuildingUpgradeOrder](ctx, BuildingUpgradeOrdersTableName, sq.Eq{"id": id})
}

func GetBuildingUpgradeOrders(ctx context.Context, opts ...QueryOption) ([]BuildingUpgradeOrder, error) {
	return findQuery[BuildingUpgradeOrder](ctx, BuildingUpgradeOrdersTableName, opts...)
}

func UpdateBuildingUpgradeOrder(ctx context.Context, id uint32, order BuildingUpgradeOrder) error {
	return updateQuery(ctx, BuildingUpgradeOrdersTableName, order, sq.Eq{"id": id})
}

func DeleteBuildingUpgradeOrder(ctx context.Context, id uint32) error {
	return deleteQuery(ctx, BuildingUpgradeOrdersTableName, sq.Eq{"id": id})
}
