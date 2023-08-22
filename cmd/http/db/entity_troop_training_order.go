package db

import (
	"context"
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type TroopTrainingOrder struct {
	Id       uint32 `json:"id" db:"id"`
	Quantity uint32 `json:"quantity" db:"quantity"`
	TimeLeft uint32 `json:"time_left" db:"time_left"`

	TroopId   uint32 `json:"troop_id" db:"troop_id"`
	troop     *Troop
	VillageId uint32 `json:"village_id" db:"village_id"`
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
		Cost:     CalculateTrainCost(o.Quantity).ToProtobuf(),
		Troop:    troop.ToProtobuf(), // TODO: Return troop kind instead of troop
	}, nil
}

func (o *TroopTrainingOrder) Troop(ctx context.Context) (Troop, error) {
	if o.troop == nil {
		troop, found, err := GetTroop(ctx, o.TroopId)
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
		village, found, err := GetVillage(ctx, o.VillageId)
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
