package state

import serverv1 "war-of-faith/pkg/protobuf/server/v1"

func NewWorld(patchChan chan *serverv1.SubscribeToWorldResponse_Patch) *World {
	world := &World{
		World: &serverv1.World{
			Tick:   0,
			Width:  10,
			Height: 10,
			Buildings: map[string]*serverv1.Building{
				Building_HALL: {
					Id:   Building_HALL,
					Name: "Village Hall",
					Cost: []*serverv1.Resources{
						{Gold: 10, Time: 10},
						{Gold: 20, Time: 10},
						{Gold: 30, Time: 10},
					},
				},
				Building_GOLD_MINE: {
					Id:   Building_GOLD_MINE,
					Name: "Gold Mine",
					Cost: []*serverv1.Resources{
						{Gold: 10, Time: 10},
						{Gold: 20, Time: 10},
						{Gold: 30, Time: 10},
					},
				},
			},
			Troops: map[string]*serverv1.Troop{
				Troop_LEADER: {
					Id:   Troop_LEADER,
					Name: "Leader",
					Cost: &serverv1.Resources{
						Gold: 50,
						Time: 20,
					},
				},
				Troop_RAIDER: {
					Id:   Troop_RAIDER,
					Name: "Raider",
					Cost: &serverv1.Resources{
						Gold: 5,
						Time: 2,
					},
				},
			},
			Players: map[string]*serverv1.Player{
				"1": {Id: "1"},
				"2": {Id: "2"},
			},
			Fields:         map[string]*serverv1.World_Field{},
			Villages:       map[string]*serverv1.Village{},
			Temples:        map[string]*serverv1.Temple{},
			MovementOrders: []*serverv1.MovementOrder{},
		},
		patchChan: patchChan,
	}

	world.CreateVillage("3_4", "1")
	world.CreateVillage("6_5", "2")

	world.CreateTemple("1_1")
	world.CreateTemple("8_1")
	world.CreateTemple("8_8")
	world.CreateTemple("1_8")

	return world
}
