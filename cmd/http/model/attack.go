package model

import (
	"context"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	sq "github.com/Masterminds/squirrel"
)

const AttacksTableName = "attacks"

type Attack struct {
	Id            uint32         `db:"id"`
	TroopQuantity Troop_Quantity `db:"troop_quantity"`
	TimeLeft      uint32         `db:"time_left"`

	WorldFieldId uint32 `db:"world_field_id"`
	VillageId    uint32 `db:"village_id"`
	PlayerId     uint32 `db:"player_id"`

	worldField *WorldField
	village    *Village
}

/* PROTOBUF */
func (a Attack) ToProtobuf() (*serverv1.Attack, error) {
	return &serverv1.Attack{
		Id:            a.Id,
		VillageId:     a.VillageId,
		WorldFieldId:  a.WorldFieldId,
		TroopQuantity: a.TroopQuantity.ToProtobuf(),
		TimeLeft:      a.TimeLeft,
	}, nil
}

func (a *Attack) WorldField(ctx context.Context) (WorldField, error) {
	if a.worldField == nil {
		worldField, err := db.First[WorldField](ctx, sq.Select("*").From(WorldFieldsTableName), sq.Eq{"id": a.WorldFieldId})
		if err != nil {
			return WorldField{}, err
		}
		a.worldField = &worldField
	}
	return *a.worldField, nil
}

func (a *Attack) Village(ctx context.Context) (Village, error) {
	if a.village == nil {
		village, err := db.First[Village](ctx, sq.Select("*").From(VillagesTableName), sq.Eq{"id": a.VillageId})
		if err != nil {
			return Village{}, err
		}
		a.village = &village
	}
	return *a.village, nil
}
