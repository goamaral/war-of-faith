package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

// TODO: Define troop training costs
// TODO: Apply barracks bonus
func CalculateTrainCost(quantity uint32) Resources {
	return (Resources{Time: 10, Gold: 10}).Multiply(quantity)
}

type Troop struct {
	Id       uint32              `db:"id"`
	Kind     serverv1.Troop_Kind `db:"kind"`
	Name     string              `db:"name"`
	Quantity uint32              `db:"quantity"`

	VillageId uint32 `db:"village_id"`
	village   *Village
}

func (t Troop) ToProtobuf() *serverv1.Troop {
	return &serverv1.Troop{
		Id:       t.Id,
		Kind:     t.Kind,
		Name:     t.Name,
		Quantity: t.Quantity,
	}
}

func (t *Troop) Village(ctx context.Context) (Village, error) {
	if t.village == nil {
		village, found, err := GetVillage(ctx, t.VillageId)
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, db.ErrNotFound
		}
		t.village = &village
	}
	return *t.village, nil
}
