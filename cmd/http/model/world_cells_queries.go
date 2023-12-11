package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

const WorldFieldsTableName = "world_fields"

func CreateWorldField(ctx context.Context, x uint32, y uint32, entityKind serverv1.World_Field_EntityKind, entityId uint32) (WorldField, error) {
	field := WorldField{
		X:          x,
		Y:          y,
		EntityKind: entityKind,
		EntityId:   entityId,
	}
	return field, db.Insert(ctx, WorldFieldsTableName, &field)
}

func GetWorldFields(ctx context.Context, opts ...db.QueryOption) ([]WorldField, error) {
	return db.Find[WorldField](ctx, WorldFieldsTableName, opts...)
}

func GetWorldField(ctx context.Context, opts ...db.QueryOption) (WorldField, bool, error) {
	return db.FindOne[WorldField](ctx, WorldFieldsTableName, opts...)
}
