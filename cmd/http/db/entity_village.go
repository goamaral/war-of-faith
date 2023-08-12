package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9/exp"
	"github.com/samber/lo"
)

type Village struct {
	Id uint32 `db:"id"`

	Gold uint32 `db:"gold"`

	buildings *[]Building
}

func (v *Village) ToProtobuf(ctx context.Context) (*serverv1.Village, error) {
	if v == nil {
		return nil, nil
	}

	buildings, err := v.Buildings(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get buildings: %w", err)
	}

	return &serverv1.Village{
		Id: v.Id,
		Resources: &serverv1.Resources{
			Gold: v.Gold,
		},
		Buildings: lo.Map(buildings, func(b Building, _ int) *serverv1.Building { return b.ToProtobuf() }),
	}, nil
}

func (v *Village) Buildings(ctx context.Context) ([]Building, error) {
	if v.buildings == nil {
		buildings, err := GetBuildings(ctx, exp.Ex{"village_id": v.Id})
		if err != nil {
			return nil, err
		}
		v.buildings = &buildings
	}
	return *v.buildings, nil
}
