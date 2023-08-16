package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/doug-martin/goqu/v9/exp"
)

type TroopTrainingOrder struct {
	Id       uint32 `db:"id"`
	Quantity uint32 `db:"quantity"`
	TimeLeft uint32 `db:"time_left"`

	TroopId   uint32 `db:"troop_id"`
	troop     *Troop
	VillageId uint32 `db:"village_id"`
	village   *Village
}

func (o *TroopTrainingOrder) ToProtobuf(ctx context.Context) (*serverv1.Troop_TrainingOrder, error) {
	troop, err := o.Troop(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop (id: %d): %w", o.TroopId, err)
	}

	return &serverv1.Troop_TrainingOrder{
		Id:       o.Id,
		Quantity: o.Quantity,
		TimeLeft: o.TimeLeft,
		Cost:     troop.TrainCost(o.Quantity).ToProtobuf(),
		Troop:    troop.ToProtobuf(), // TODO: Return troop kind instead of troop
	}, nil
}

func (o *TroopTrainingOrder) Troop(ctx context.Context) (Troop, error) {
	if o.troop == nil {
		troop, found, err := GetTroop(ctx, exp.Ex{"id": o.TroopId})
		if err != nil {
			return Troop{}, err
		}
		if !found {
			return Troop{}, ErrNotFound
		}
		o.troop = &troop
	}
	return *o.troop, nil
}

func (o *TroopTrainingOrder) Village(ctx context.Context) (Village, error) {
	if o.village == nil {
		village, found, err := GetVillage(ctx, exp.Ex{"id": o.VillageId})
		if err != nil {
			return Village{}, err
		}
		if !found {
			return Village{}, ErrNotFound
		}
		o.village = &village
	}
	return *o.village, nil
}
