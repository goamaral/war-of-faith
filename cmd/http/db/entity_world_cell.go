package db

import (
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type WorldCell struct {
	Coords     string                         `db:"coords"`
	X          uint32                         `db:"x"`
	Y          uint32                         `db:"y"`
	EntityKind serverv1.World_Cell_EntityKind `db:"entity_kind"`
	EntityId   uint32                         `db:"entity_id"`
}

func (wc WorldCell) ToProtobuf() (*serverv1.World_Cell, error) {
	return &serverv1.World_Cell{
		Coords:     wc.Coords,
		X:          wc.X,
		Y:          wc.Y,
		EntityKind: wc.EntityKind,
		EntityId:   wc.EntityId,
	}, nil
}
