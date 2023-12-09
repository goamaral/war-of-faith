package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"github.com/samber/lo"
)

type Troop struct {
	Kind Troop_Kind
	Name string
}

func (t Troop) ToProtobuf() *serverv1.Troop {
	return &serverv1.Troop{
		Kind: string(t.Kind),
		Name: t.Kind.String(),
	}
}

var Troops = []Troop{
	{Kind: Troop_Kind_LEADER, Name: "Leader"},
}

/* TROOP KIND */
var ErrUnknownTroopKind = errors.New("unknown troop kind")

type Troop_Kind string

const (
	Troop_Kind_LEADER Troop_Kind = "leader"
)

func (tk Troop_Kind) String() string {
	switch tk {
	case Troop_Kind_LEADER:
		return "Leader"
	default:
		return "unknown"
	}
}

// TODO: Define troop training costs
// TODO: Apply barracks bonus
func (tq Troop_Kind) CalculateTrainingCost(quantity uint32, barracksLevel uint) Resources {
	return (Resources{Time: 10, Gold: 10}).Multiply(quantity)
}

/* PROTOBUF */
var validTroop_Kinds = []Troop_Kind{Troop_Kind_LEADER}

func Troop_KindFromProtobuf(pTroopKind string) (Troop_Kind, error) {
	if lo.Contains(validTroop_Kinds, Troop_Kind(pTroopKind)) {
		return Troop_Kind(pTroopKind), nil
	}
	return "", ErrUnknownTroopKind
}

/* TROOP QUANTITY  */
// Never access this map directly
type Troop_Quantity map[Troop_Kind]uint32

func (tq Troop_Quantity) Value() (driver.Value, error) {
	return json.Marshal(tq)
}

func (tq *Troop_Quantity) Scan(value any) error {
	if value == nil {
		return nil
	}
	return json.Unmarshal(value.([]byte), tq)
}

func (tq Troop_Quantity) Get(kind Troop_Kind) uint32 {
	if tq == nil {
		return 0
	}
	return tq[kind]
}

func (tq *Troop_Quantity) Increment(kind Troop_Kind, quantity uint32) uint32 {
	if *tq == nil {
		*tq = Troop_Quantity{}
	}
	(*tq)[kind] += quantity
	return (*tq)[kind]
}

func (tq Troop_Quantity) ToProtobuf() map[string]uint32 {
	pbQuantity := make(map[string]uint32, len(tq))
	for kind, quantity := range tq {
		pbQuantity[string(kind)] = quantity
	}
	return pbQuantity
}
