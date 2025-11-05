package state

import (
	"sync"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"

	"google.golang.org/protobuf/types/known/wrapperspb"
)

var (
	Building_HALL      = "hall"
	Building_GOLD_MINE = "gold-mine"

	Troop_LEADER = "leader"
	Troop_RAIDER = "raider"
)

type World struct {
	*serverv1.World
	sync.RWMutex
	patchChan chan *serverv1.SubscribeToWorldResponse_Patch
}

func (w *World) CreateVillage(coords string, playerId string) {
	w.Fields[coords] = &serverv1.World_Field{
		Coords:    coords,
		Kind:      serverv1.World_Field_KIND_VILLAGE,
		Resources: &serverv1.Resources{},
		Buildings: map[string]uint32{
			Building_HALL:      1,
			Building_GOLD_MINE: 1,
		},
		Troops: map[string]uint32{
			Troop_LEADER: 0,
			Troop_RAIDER: 0,
		},
		PlayerId: wrapperspb.String(playerId),
	}
	w.Villages[coords] = &serverv1.Village{}
}

func (w *World) CreateTemple(coords string) {
	w.Fields[coords] = &serverv1.World_Field{
		Coords:    coords,
		Kind:      serverv1.World_Field_KIND_TEMPLE,
		Resources: &serverv1.Resources{},
		Buildings: map[string]uint32{},
		Troops: map[string]uint32{
			Troop_LEADER: 0,
			Troop_RAIDER: 0,
		},
	}
	w.Temples[coords] = &serverv1.Temple{}
}
