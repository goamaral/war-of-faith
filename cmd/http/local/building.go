package local

import serverv1 "war-of-faith/pkg/protobuf/server/v1"

type Building struct {
	Kind            serverv1.Building_Kind
	Level           uint32
	VillageId       uint32
	UpgradeTimeLeft uint32
	UpgradeCost     Resources
}

func (b *Building) ToProtobuf() *serverv1.Building {
	return &serverv1.Building{
		Kind:            b.Kind,
		Level:           b.Level,
		VillageId:       b.VillageId,
		IsUpgradable:    b.IsUpgradable(),
		UpgradeTimeLeft: b.UpgradeTimeLeft,
		UpgradeCost:     b.UpgradeCost.ToProtobuf(),
	}
}

func (b *Building) IsUpgradable() bool {
	return true
}
