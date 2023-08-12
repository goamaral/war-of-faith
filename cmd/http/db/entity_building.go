package db

import serverv1 "war-of-faith/pkg/protobuf/server/v1"

type Building struct {
	Id    uint32                 `db:"id"`
	Kind  serverv1.Building_Kind `db:"kind"`
	Level uint32                 `db:"level"`

	UpgradeTimeLeft uint32 `db:"upgrade_time_left"`
	UpgradeGoldCost uint32 `db:"upgrade_gold_cost"`

	VillageId uint32 `db:"village_id"`
}

func (b *Building) ToProtobuf() *serverv1.Building {
	return &serverv1.Building{
		Id:           b.Id,
		Kind:         b.Kind,
		Level:        b.Level,
		IsUpgradable: b.IsUpgradable(),

		UpgradeTimeLeft: b.UpgradeTimeLeft,
		UpgradeCost: &serverv1.Resources{
			Gold: b.UpgradeGoldCost,
		},

		VillageId: b.VillageId,
	}
}

func (b *Building) IsUpgradable() bool {
	return true
}
