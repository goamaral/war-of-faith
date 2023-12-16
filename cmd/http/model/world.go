package model

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type World struct {
	Width  uint32 `db:"width"`
	Height uint32 `db:"height"`

	fields *[]WorldField
}

func (w *World) ToProtobuf(ctx context.Context, loadFields bool) (*serverv1.World, error) {
	pFields := []*serverv1.World_Field{}
	if loadFields {
		fields, err := w.Fields(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get fields: %w", err)
		}

		for _, field := range fields {
			pField, err := field.ToProtobuf()
			if err != nil {
				return nil, fmt.Errorf("failed to convert field (coords: %s) to protobuf: %w", field.Coords, err)
			}
			pFields = append(pFields, pField)
		}
	}

	return &serverv1.World{
		Width:  w.Width,
		Height: w.Height,
		Fields: pFields,
	}, nil
}

func (w *World) Fields(ctx context.Context) ([]WorldField, error) {
	if w.fields == nil {
		fields, err := GetWorldFields(ctx)
		if err != nil {
			return nil, err
		}
		w.fields = &fields
	}
	return *w.fields, nil
}
