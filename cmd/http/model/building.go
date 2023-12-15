package model

import (
	"errors"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/samber/lo"
)

const BuildingMaxLevel = 10

var ErrUnknownBuildingKind = errors.New("unknown building kind")
var BuildingKinds = []Building_Kind{
	Building_Kind_HALL,
	Building_Kind_GOLD_MINE,
}

type Building_Kind string

const (
	Building_Kind_HALL      Building_Kind = "hall"
	Building_Kind_GOLD_MINE Building_Kind = "gold-mine"
)

func (tk Building_Kind) String() string {
	return string(tk)
}

func (tk Building_Kind) Name() string {
	switch tk {
	case Building_Kind_HALL:
		return "Village Hall"
	case Building_Kind_GOLD_MINE:
		return "Gold Mine"
	}
	// TODO: Log warning
	return "Unknown"
}

// TODO: Define building upgrade costs
// TODO: Apply hall bonus
func (bl Building_Kind) CalculateUpgradeCost(level uint32, hallLevel uint32) Resources {
	return (Resources{Time: 10, Gold: 10})
}

func (bk Building_Kind) ToBuildingProtobuf() *serverv1.Building {
	return &serverv1.Building{
		Kind: bk.String(),
		Name: bk.Name(),
	}
}

func Building_KindFromProtobuf(pBuildingKind string) (Building_Kind, error) {
	if lo.Contains(BuildingKinds, Building_Kind(pBuildingKind)) {
		return Building_Kind(pBuildingKind), nil
	}
	return "", ErrUnknownBuildingKind
}

/* BUILDING LEVEL  */
type Building_Level struct {
	db.JsonMap[Building_Kind, uint32]
}

func (bl *Building_Level) Increment(kind Building_Kind) uint32 {
	bl.JsonMap[kind] += 1
	return bl.JsonMap[kind]
}
