package db

import (
	"context"
	"fmt"

	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const VillagesTableName = "villages"

func CreateVillage(ctx context.Context) (Village, error) {
	village := Village{buildings: &[]Building{}, troops: &[]Troop{}}
	err := insertQuery(ctx, VillagesTableName, &village)
	if err != nil {
		return Village{}, fmt.Errorf("failed to create village: %w", err)
	}

	/* BUILDINGS */
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

	/* TROOPS */
	// Leaders
	leaders, err := CreateTroop(ctx, &Troop{Kind: serverv1.Troop_KIND_LEADER, Name: "Leader", VillageId: village.Id})
	if err != nil {
		return Village{}, fmt.Errorf("failed to create leader troops: %w", err)
	}
	*village.troops = append(*village.troops, *leaders)

	return village, nil
}

func GetVillages(ctx context.Context, exprs ...QryExp) ([]Village, error) {
	return findQuery[Village](ctx, VillagesTableName, exprs...)
}

func GetVillage(ctx context.Context, id uint32) (Village, bool, error) {
	return firstQuery[Village](ctx, VillagesTableName, sq.Eq{"id": id})
}

func UpdateVillage(ctx context.Context, id uint32, village Village) error {
	return updateQuery(ctx, VillagesTableName, village, sq.Eq{"id": id})
}
