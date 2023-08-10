package local

import (
	"fmt"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

var villages = []*Village{}

func init() {
	createVillage()
}

func createVillage() {
	villageId := uint32(len(villages)) + 1
	villages = append(villages, &Village{
		Id: villageId,
		Buildings: Village_Buildings{
			Hall: Building{
				Kind:        serverv1.Building_KIND_HALL,
				Level:       1,
				VillageId:   villageId,
				UpgradeCost: Resources{Gold: 10},
			},
			GoldMine: Building{
				Kind:        serverv1.Building_KIND_GOLD_MINE,
				Level:       1,
				VillageId:   villageId,
				UpgradeCost: Resources{Gold: 10},
			},
		},
	})
}

func GetVillageById(id uint32) (*Village, bool) {
	if id == 0 || id > uint32(len(villages)) {
		return nil, false
	}
	return villages[id-1], true
}

func UpgradeBuilding(villageId uint32, kind serverv1.Building_Kind) (*Building, bool, error) {
	village, found := GetVillageById(villageId)
	if !found {
		return nil, false, fmt.Errorf("village (id: %d) not found", villageId)
	}

	var building *Building
	switch kind {
	case serverv1.Building_KIND_HALL:
		building = &village.Buildings.Hall
	case serverv1.Building_KIND_GOLD_MINE:
		building = &village.Buildings.GoldMine
	}
	if building == nil {
		return nil, false, fmt.Errorf("building not found")
	}

	if building.IsUpgradable() {
		building.Level++
	} else {
		return building, false, nil
	}

	return building, true, nil
}
