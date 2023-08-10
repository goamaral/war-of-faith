package local

import serverv1 "war-of-faith/pkg/protobuf/server/v1"

type Village struct {
	Id uint32

	Resources Resources
	Buildings Village_Buildings
}

func (v *Village) ToProtobuf() *serverv1.Village {
	if v == nil {
		return nil
	}
	return &serverv1.Village{
		Id:        v.Id,
		Resources: v.Resources.ToProtobuf(),
		Buildings: v.Buildings.ToProtobuf(),
	}
}

type Resources struct {
	Gold uint32
}

func (r *Resources) ToProtobuf() *serverv1.Resources {
	if r == nil {
		return nil
	}
	return &serverv1.Resources{
		Gold: r.Gold,
	}
}

type Village_Buildings struct {
	Hall     Building
	GoldMine Building
}

func (vb *Village_Buildings) ToProtobuf() *serverv1.Village_Buildings {
	if vb == nil {
		return nil
	}
	return &serverv1.Village_Buildings{
		Hall:     vb.Hall.ToProtobuf(),
		GoldMine: vb.GoldMine.ToProtobuf(),
	}
}
