package model

import (
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type WorldField struct {
	X          uint32                          `db:"x"`
	Y          uint32                          `db:"y"`
	EntityKind serverv1.World_Field_EntityKind `db:"entity_kind"`
	EntityId   uint32                          `db:"entity_id"`
}

func (wc WorldField) ToProtobuf() (*serverv1.World_Field, error) {
	return &serverv1.World_Field{
		Coords:     &serverv1.Coords{X: wc.X, Y: wc.Y},
		EntityKind: wc.EntityKind,
		EntityId:   wc.EntityId,
	}, nil
}
