package model

import (
	"errors"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/samber/lo"
)

var ErrUnknownTroopKind = errors.New("unknown troop kind")
var TroopKinds = []Troop_Kind{Troop_Kind_LEADER}

type Troop_Kind string

const (
	Troop_Kind_LEADER Troop_Kind = "leader"
)

func (tk Troop_Kind) String() string {
	return string(tk)
}

func (tk Troop_Kind) Name() string {
	switch tk {
	case Troop_Kind_LEADER:
		return "Leader"
	}
	// TODO: Log warning
	return "Unknown"
}

// TODO: Define troop training costs
// TODO: Apply barracks bonus
func (tq Troop_Kind) CalculateTrainingCost(quantity uint32, barracksLevel uint) Resources {
	return (Resources{Time: 10, Gold: 10}).Multiply(quantity)
}

func (tk Troop_Kind) ToTroopProtobuf() *serverv1.Troop {
	return &serverv1.Troop{
		Kind: tk.String(),
		Name: tk.Name(),
	}
}

func Troop_KindFromProtobuf(pTroopKind string) (Troop_Kind, error) {
	if lo.Contains(TroopKinds, Troop_Kind(pTroopKind)) {
		return Troop_Kind(pTroopKind), nil
	}
	return "", ErrUnknownTroopKind
}

/* TROOP QUANTITY  */
type Troop_Quantity struct {
	db.JsonMap[Troop_Kind, uint32]
}

func (tq *Troop_Quantity) Increment(kind Troop_Kind, quantity uint32) {
	tq.Set(kind, tq.Get(kind)+quantity)
}
