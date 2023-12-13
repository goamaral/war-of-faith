package model

import (
	"context"
	"fmt"

	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type Player struct {
	Id uint32 `db:"id"`
}

/* PROTOBUF */
func (p *Player) ToProtobuf(ctx context.Context) (*serverv1.Player, error) {
	trainableLeaders, err := GetPlayerTrainableLeaders(ctx, p.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get player trainable leaders: %w", err)
	}

	return &serverv1.Player{
		Id:               p.Id,
		TrainableLeaders: trainableLeaders,
	}, nil
}
