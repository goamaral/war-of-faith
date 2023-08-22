package db

import (
	"context"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

var TroopTrainCost = Resources{
	Time: 10,
	Gold: 10,
}

func CalculateTrainCost(quantity uint32) Resources {
	return TroopTrainCost.Multiply(quantity)
}

type Troop struct {
	Id       uint32              `json:"id" db:"id"`
	Kind     serverv1.Troop_Kind `json:"kind" db:"kind"`
	Name     string              `json:"name" db:"name"`
	Quantity uint32              `json:"quantity" db:"quantity"`

	VillageId uint32 `json:"village_id" db:"village_id"`
	village   *Village
}

func (t Troop) ToProtobuf() *serverv1.Troop {
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
		village, found, err := GetVillage(ctx, t.VillageId)
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, ErrNotFound
		}
		t.village = &village
	}
	return *t.village, nil
}
