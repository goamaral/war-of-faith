package model

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

const WorldCellsTableName = "world_cells"

func CreateWorldCell(ctx context.Context, x uint32, y uint32, entityKind serverv1.World_Cell_EntityKind, entityId uint32) (WorldCell, error) {
	cell := WorldCell{
		Coords:     fmt.Sprintf("%d,%d", x, y),
		X:          x,
		Y:          y,
		EntityKind: entityKind,
		EntityId:   entityId,
	}
	return cell, db.Insert(ctx, WorldCellsTableName, &cell)
}

func GetWorldCells(ctx context.Context, opts ...db.QueryOption) ([]WorldCell, error) {
	return db.Find[WorldCell](ctx, WorldCellsTableName, opts...)
}
