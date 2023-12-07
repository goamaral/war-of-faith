package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type TroopTrainingOrder struct {
	Id       uint32 `db:"id"`
	Quantity uint32 `db:"quantity"`
	TimeLeft uint32 `db:"time_left"`

	TroopId   uint32 `db:"troop_id"` // TODO: Use Troop.Kind instead
	troop     *Troop
	VillageId uint32 `db:"village_id"` // TODO: Remove when joins are implemented
}

func (o *TroopTrainingOrder) ToProtobuf(ctx context.Context) (*serverv1.Troop_TrainingOrder, error) {
	return &serverv1.Troop_TrainingOrder{
		Id:       o.Id,
		Quantity: o.Quantity,
		TimeLeft: o.TimeLeft,
		Cost:     CalculateTrainCost(o.Quantity).ToProtobuf(),
		TroopId:  o.TroopId,
	}, nil
}

func (o *TroopTrainingOrder) Troop(ctx context.Context) (Troop, error) {
	if o.troop == nil {
		troop, found, err := GetTroop(ctx, o.TroopId)
		if err != nil {
			return Troop{}, err
		}
		if !found {
			return Troop{}, db.ErrNotFound
		}
		o.troop = &troop
	}
	return *o.troop, nil
}
