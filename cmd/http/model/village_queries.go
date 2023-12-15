package model

import (
	"context"
	"fmt"

	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const VillagesTableName = "villages"

func CreateVillage(ctx context.Context, x uint32, y uint32, playerId uint32) (Village, error) {
	village := Village{
		BuildingLevel: Building_Level{
			JsonMap: db.JsonMap[Building_Kind, uint32]{
				Building_Kind_HALL:      1,
				Building_Kind_GOLD_MINE: 1,
			},
		},
		TroopQuantity: Troop_Quantity{
			JsonMap: db.JsonMap[Troop_Kind, uint32]{
				Troop_Kind_LEADER: 0,
			},
		},
		PlayerId: playerId,
	}
	err := db.Insert(ctx, VillagesTableName, &village)
	if err != nil {
		return Village{}, fmt.Errorf("failed to create village: %w", err)
	}

	_, err = CreateWorldField(ctx, x, y, serverv1.World_Field_ENTITY_KIND_VILLAGE, village.Id)
	if err != nil {
		return Village{}, fmt.Errorf("failed to create village world field: %w", err)
	}

	return village, nil
}

func GetVillages(ctx context.Context, opts ...db.QueryOption) ([]Village, error) {
	return db.Find[Village](ctx, VillagesTableName, opts...)
}

func GetVillage(ctx context.Context, id uint32) (Village, bool, error) {
	return db.FindOne[Village](ctx, VillagesTableName, sq.Eq{"id": id})
}

func UpdateVillage(ctx context.Context, id uint32, village Village) error {
	return db.Update(ctx, VillagesTableName, village, sq.Eq{"id": id})
}
