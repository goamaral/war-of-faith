package model

import serverv1 "war-of-faith/pkg/protobuf/server/v1"

type Resources struct {
	Time uint32
	Gold uint32
}

func (r Resources) ToProtobuf() *serverv1.Resources {
	return &serverv1.Resources{
		Time: r.Time,
		Gold: r.Gold,
	}
}

func (r Resources) Multiply(multiplier uint32) Resources {
	return Resources{
		Time: r.Time * multiplier,
		Gold: r.Gold * multiplier,
	}
}
