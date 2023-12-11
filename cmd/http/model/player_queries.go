package model

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"
)

const PlayerTableName = "players"

func CreatePlayer(ctx context.Context, x, y uint32) (Player, error) {
	var player Player
	err := db.Insert[Player](ctx, PlayerTableName, &player)
	if err != nil {
		return Player{}, fmt.Errorf("failed to create player: %w", err)
	}

	_, err = CreateVillage(context.Background(), x, y, player.Id)
	if err != nil {
		return Player{}, fmt.Errorf("failed to create village: %w", err)
	}

	return player, nil
}
