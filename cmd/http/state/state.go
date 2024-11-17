package state

import serverv1 "war-of-faith/pkg/protobuf/server/v1"

func NewWorld(patchChan chan *serverv1.SubscribeToWorldResponse_Patch) *World {
	world := &World{
		World: &serverv1.World{
			Width:  10,
			Height: 10,
			Buildings: map[string]*serverv1.Building{
				Building_HALL: {
					Id:   Building_HALL,
					Name: "Village Hall",
				},
				Building_GOLD_MINE: {
					Id:   Building_GOLD_MINE,
					Name: "Gold Mine",
				},
			},
			Troops: map[string]*serverv1.Troop{
				Troop_LEADER: {
					Id:   Troop_LEADER,
					Name: "Leader",
				},
			},
			Players: map[string]*serverv1.Player{
				"1": {Id: "1"},
				"2": {Id: "2"},
			},
			Fields:   map[string]*serverv1.World_Field{},
			Villages: map[string]*serverv1.Village{},
			Temples: map[string]*serverv1.Temple{
				"1,1": {Coords: "1,1", Resources: &serverv1.Resources{}},
				"8,1": {Coords: "8,1", Resources: &serverv1.Resources{}},
				"8,8": {Coords: "8,8", Resources: &serverv1.Resources{}},
				"1,8": {Coords: "1,8", Resources: &serverv1.Resources{}},
			},
			Attacks: map[string]*serverv1.Attack{},
		},
		patchChan: patchChan,
	}

	world.CreateVillage("3,4", "1")
	world.CreateVillage("6,5", "2")

	return world
}
