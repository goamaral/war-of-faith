package model

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"

	sq "github.com/Masterminds/squirrel"
)

const PlayersTableName = "players"

func CreatePlayer(ctx context.Context, coords Coords) (Player, error) {
	var player Player
	_, err := db.Insert[Player](ctx, PlayersTableName, &player)
	if err != nil {
		return Player{}, fmt.Errorf("failed to create player: %w", err)
	}

	_, err = BootstrapVillage(context.Background(), coords, player.Id)
	if err != nil {
		return Player{}, fmt.Errorf("failed to create village: %w", err)
	}

	return player, nil
}

func GetPlayer(ctx context.Context, id uint32) (Player, bool, error) {
	return db.FindOne[Player](ctx, PlayersTableName, sq.Eq{"id": id})
}

func GetPlayerTrainableLeaders(ctx context.Context, playerId uint32) (uint32, error) {
	nLeaders, err := db.First[uint32](ctx,
		sq.Select("SUM(troop_quantity->>\"$.leader\")").From(VillagesTableName),
		sq.Eq{"player_id": playerId},
	)
	if err != nil {
		return 0, fmt.Errorf("failed to get number of leaders: %w", err)
	}
	nLeadersInTraining, err := db.First[uint32](ctx,
		sq.Select("COUNT(*)").From(TroopTrainingOrdersTableName),
		db.InnerJoinQueryOption(VillagesTableName, "villages.id = troop_training_orders.village_id"),
		sq.Eq{"troop_kind": Troop_Kind_LEADER},
		sq.Eq{"villages.player_id": playerId},
	)
	if err != nil {
		return 0, fmt.Errorf("failed to get leaders in training: %w", err)
	}
	// TODO: Get leaders in attacks
	nVillages, err := db.First[uint32](ctx,
		sq.Select("COUNT(*)").From(VillagesTableName),
		sq.Eq{"player_id": playerId},
	)
	if err != nil {
		return 0, fmt.Errorf("failed to get player village count: %w", err)
	}
	return nVillages - (nLeaders + nLeadersInTraining), nil
}

func GetPlayerVilageIds(ctx context.Context, playerId uint32) ([]uint32, error) {
	return db.Find[uint32](ctx,
		sq.Select("id").From(VillagesTableName),
		sq.Eq{"player_id": playerId},
	)
}
