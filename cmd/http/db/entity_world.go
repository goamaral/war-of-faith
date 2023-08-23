package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type World struct {
	Width  uint32 `db:"width"`
	Height uint32 `db:"height"`

	cells *[]WorldCell
}

func (w *World) ToProtobuf(ctx context.Context, loadCells bool) (*serverv1.World, error) {
	cells, err := w.Cells(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get cells: %w", err)
	}

	pCells := map[string]*serverv1.World_Cell{}
	if loadCells {
		for _, cell := range cells {
			pCells[cell.Coords], err = cell.ToProtobuf()
			if err != nil {
				return nil, fmt.Errorf("failed to convert cell (coords: %s) to protobuf: %w", cell.Coords, err)
			}
		}
	}

	return &serverv1.World{
		Width:  w.Width,
		Height: w.Height,
		Cells:  pCells,
	}, nil
}

func (w *World) Cells(ctx context.Context) ([]WorldCell, error) {
	if w.cells == nil {
		cells, err := GetWorldCells(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get world cells: %w", err)
		}
		w.cells = &cells
	}
	return *w.cells, nil
}
