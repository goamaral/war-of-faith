package model

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const TemplesTableName = "temples"

func CreateTemple(ctx context.Context, coords Coords) (Temple, error) {
	temple := Temple{}
	_, err := db.Insert(ctx, TemplesTableName, &temple)
	if err != nil {
		return Temple{}, fmt.Errorf("failed to create temple: %w", err)
	}

	_, err = CreateWorldField(ctx, coords, serverv1.World_Field_ENTITY_KIND_TEMPLE, temple.Id)
	if err != nil {
		return Temple{}, fmt.Errorf("failed to create temple world field: %w", err)
	}

	return temple, nil
}

func GetTemple(ctx context.Context, id uint32) (Temple, bool, error) {
	return db.FindOne[Temple](ctx, TemplesTableName, sq.Eq{"id": id})
}

func GetTemples(ctx context.Context, opts ...db.QueryOption) ([]Temple, error) {
	return db.Find[Temple](ctx, sq.Select("*").From(TemplesTableName), opts...)
}

func UpdateTemple(ctx context.Context, id uint32, temple Temple) error {
	return db.Update(ctx, TemplesTableName, temple, sq.Eq{"id": id})
}
