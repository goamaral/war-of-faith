package model

import (
	"context"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type Temple struct {
	Id uint32 `db:"id"`
}

func (t *Temple) ToProtobuf(ctx context.Context) (*serverv1.Temple, error) {
	return &serverv1.Temple{Id: t.Id}, nil
}
