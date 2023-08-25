package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const TemplesTableName = "temples"

func CreateTemple(ctx context.Context, x uint32, y uint32) (Temple, error) {
	temple := Temple{}
	err := insertQuery(ctx, TemplesTableName, &temple)
	if err != nil {
		return Temple{}, fmt.Errorf("failed to create temple: %w", err)
	}

	_, err = CreateWorldCell(ctx, x, y, serverv1.World_Cell_ENTITY_KIND_TEMPLE, temple.Id)
	if err != nil {
		return Temple{}, fmt.Errorf("failed to create temple world cell: %w", err)
	}

	return temple, nil
}

func GetTemple(ctx context.Context, id uint32) (Temple, bool, error) {
	return firstQuery[Temple](ctx, TemplesTableName, sq.Eq{"id": id})
}

func GetTemples(ctx context.Context, exprs ...QryExp) ([]Temple, error) {
	return findQuery[Temple](ctx, TemplesTableName, exprs...)
}

func UpdateTemple(ctx context.Context, id uint32, temple Temple) error {
	return updateQuery(ctx, TemplesTableName, temple, sq.Eq{"id": id})
}
