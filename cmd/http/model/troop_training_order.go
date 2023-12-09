package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type TroopTrainingOrder struct {
	Id        uint32     `db:"id"`
	Quantity  uint32     `db:"quantity"`
	TimeLeft  uint32     `db:"time_left"`
	TroopKind Troop_Kind `db:"troop_kind"`

	VillageId uint32 `db:"village_id"`
	village   *Village
}

func (o *TroopTrainingOrder) ToProtobuf(ctx context.Context) (*serverv1.Troop_TrainingOrder, error) {
	return &serverv1.Troop_TrainingOrder{
		Id:        o.Id,
		Quantity:  o.Quantity,
		TimeLeft:  o.TimeLeft,
		Cost:      o.TroopKind.CalculateTrainingCost(o.Quantity, 0).ToProtobuf(),
		TroopKind: string(o.TroopKind),
	}, nil
}

func (o *TroopTrainingOrder) Village(ctx context.Context) (Village, error) {
	if o.village == nil {
		village, found, err := GetVillage(ctx, o.VillageId)
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, db.ErrNotFound
		}
		o.village = &village
	}
	return *o.village, nil
}
