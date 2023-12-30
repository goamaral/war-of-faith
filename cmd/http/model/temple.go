package model

import (
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type Temple_Kind string

const (
	Temple_Kind_GOLD Temple_Kind = "gold"
)

type Temple struct {
	Id   uint32 `db:"id"`
	Gold uint32 `db:"gold"`
}

func (t *Temple) ToProtobuf() (*serverv1.Temple, error) {
	return &serverv1.Temple{
		Id:   t.Id,
		Gold: t.Gold,
	}, nil
}
