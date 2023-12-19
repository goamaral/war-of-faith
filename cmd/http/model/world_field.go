package model

import (
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type WorldField struct {
	Id         uint32                          `db:"id"`
	Coords     Coords                          `db:"coords"`      // TODO: Create unique index
	EntityKind serverv1.World_Field_EntityKind `db:"entity_kind"` // TODO: Convert to string enum
	EntityId   uint32                          `db:"entity_id"`
}

func (wc WorldField) ToProtobuf() (*serverv1.World_Field, error) {
	pCoords, err := wc.Coords.ToProtobuf()
	if err != nil {
		return nil, fmt.Errorf("failed to convert coords to protobuf: %w", err)
	}

	return &serverv1.World_Field{
		Id:         wc.Id,
		Coords:     pCoords,
		EntityKind: wc.EntityKind,
		EntityId:   wc.EntityId,
	}, nil
}
