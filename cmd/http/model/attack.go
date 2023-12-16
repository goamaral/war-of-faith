package model

const AttacksTableName = "attacks"

type Attack struct {
	Id            uint32         `db:"id"`
	TargetCoords  Coords         `db:"target_coords"`
	TroopQuantity Troop_Quantity `db:"troop_quantity"`
	TimeLeft      uint32         `db:"time_left"`

	VillageId uint32 `db:"village_id"`
	PlayerId  uint32 `db:"player_id"`
}
