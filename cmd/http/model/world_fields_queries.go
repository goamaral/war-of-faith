package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const WorldFieldsTableName = "world_fields"

func CreateWorldField(ctx context.Context, coords Coords, entityKind serverv1.World_Field_EntityKind, entityId uint32) (WorldField, error) {
	field := WorldField{
		Coords:     coords,
		EntityKind: entityKind,
		EntityId:   entityId,
	}
	return field, db.Insert(ctx, WorldFieldsTableName, &field)
}

func GetWorldFields(ctx context.Context, opts ...db.QueryOption) ([]WorldField, error) {
	return db.Find[WorldField](ctx, sq.Select("*").From(WorldFieldsTableName), opts...)
}

func GetWorldField(ctx context.Context, opts ...db.QueryOption) (WorldField, bool, error) {
	return db.FindOne[WorldField](ctx, WorldFieldsTableName, opts...)
}
