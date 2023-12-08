package model

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
	pCells := []*serverv1.World_Cell{}
	if loadCells {
		cells, err := w.Cells(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get cells: %w", err)
		}

		for _, cell := range cells {
			pCell, err := cell.ToProtobuf()
			if err != nil {
				return nil, fmt.Errorf("failed to convert cell (x: %d, y: %d) to protobuf: %w", cell.X, cell.Y, err)
			}
			pCells = append(pCells, pCell)
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
			return nil, err
		}
		w.cells = &cells
	}
	return *w.cells, nil
}
