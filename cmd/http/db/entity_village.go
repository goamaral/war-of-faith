package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9/exp"
)

type Village struct {
	Id uint32 `db:"id"`

	Gold uint32 `db:"gold"`

	buildings *[]Building
	troops    *[]Troop
}

func (v *Village) ToProtobuf(ctx context.Context) (*serverv1.Village, error) {
	if v == nil {
		return &serverv1.Village{}, nil
	}

	buildings, err := v.Buildings(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get buildings: %w", err)
	}
	pBuildings := make([]*serverv1.Building, len(buildings))
	for i, b := range buildings {
		pBuildings[i], err = b.ToProtobuf(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to convert building to protobuf: %w", err)
		}
	}

	troops, err := v.Troops(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village troops: %w", err)
	}
	pTroops := make([]*serverv1.Troop, len(troops))
	for i, t := range troops {
		pTroops[i] = t.ToProtobuf()
		if err != nil {
			return nil, fmt.Errorf("failed to convert village troop to protobuf: %w", err)
		}
	}

	return &serverv1.Village{
		Id: v.Id,
		Resources: &serverv1.Resources{
			Gold: v.Gold,
		},
		Buildings:        pBuildings,
		Troops:           pTroops,
		TroopTrainOrders: []*serverv1.Troop_TrainOrder{}, // TODO
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

func (v *Village) Troops(ctx context.Context) ([]Troop, error) {
	if v.troops == nil {
		troops, err := GetTroops(ctx, exp.Ex{"village_id": v.Id})
		if err != nil {
			return nil, err
		}
		v.troops = &troops
	}
	return *v.troops, nil
}
