package model

import (
	"context"
	"war-of-faith/cmd/http/db"

	sq "github.com/Masterminds/squirrel"
)

const PlayersTableName = "players"

func GetPlayer(ctx context.Context, id uint32) (Player, bool, error) {
	return db.FindOne[Player](ctx, PlayersTableName, sq.Eq{"id": id})
}
