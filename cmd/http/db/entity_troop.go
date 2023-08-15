package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9/exp"
)

var TroopTrainCost = Resources{
	Time: 10,
	Gold: 10,
}

type Troop struct {
	Id       uint32              `db:"id"`
	Kind     serverv1.Troop_Kind `db:"kind"`
	Name     string              `db:"name"`
	Quantity uint32              `db:"quantity"`

	VillageId uint32 `db:"village_id"`
	village   *Village
}

func (t *Troop) ToProtobuf() *serverv1.Troop {
	return &serverv1.Troop{
		Id:        t.Id,
		Kind:      t.Kind,
		Name:      t.Name,
		TrainCost: TroopTrainCost.ToProtobuf(),
		Quantity:  t.Quantity,
	}
}

func (t *Troop) Village(ctx context.Context) (Village, error) {
	if t.village == nil {
		village, found, err := GetVillage(ctx, exp.Ex{"id": t.VillageId})
		if err != nil {
			return Village{}, fmt.Errorf("failed to get Village: %w", err)
		}
		if !found {
			return Village{}, fmt.Errorf("Village not found")
		}
		t.village = &village
	}
	return *t.village, nil
}