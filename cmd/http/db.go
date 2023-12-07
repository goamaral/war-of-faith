package main

import (
	"context"
	"fmt"
	"war-of-faith/cmd/http/db"
	"war-of-faith/cmd/http/model"
)

func CreateDB() error {
	_, err := db.DB.Exec(`
		CREATE TABLE villages (
			id INTEGER PRIMARY KEY,
			gold INTERGER NOT NULL
		);

		CREATE TABLE buildings (
			id INTEGER PRIMARY KEY,
			kind INTERGER NOT NULL,
			level INTERGER NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE building_upgrade_orders (
			id INTEGER PRIMARY KEY,
			level INTEGER NOT NULL,
			time_left INTEGER NOT NULL,

			building_id INTEGER NOT NULL,
			village_id INTEGER NOT NULL, -- TODO: Remove when joins are implemented
			FOREIGN KEY(building_id) REFERENCES buildings(id),
			FOREIGN KEY(village_id) REFERENCES villages(id) -- TODO: Remove when joins are implemented
		);

		CREATE TABLE troops (
			id INTEGER PRIMARY KEY,
			kind INTERGER NOT NULL,
			name TEXT NOT NULL,
			quantity INTEGER NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE troop_training_orders (
			id INTEGER PRIMARY KEY,
			quantity INTEGER NOT NULL,
			time_left INTEGER NOT NULL,

			troop_id INTEGER NOT NULL,
			village_id INTEGER NOT NULL, -- TODO: Remove when joins are implemented
			FOREIGN KEY(troop_id) REFERENCES troops(id),
			FOREIGN KEY(village_id) REFERENCES villages(id) -- TODO: Remove when joins are implemented
		);

		CREATE TABLE world_cells (
			coords TEXT PRIMARY KEY,
			x INTEGER NOT NULL,
			y INTEGER NOT NULL,
			entity_kind INTERGER NOT NULL,
			entity_id INTEGER NOT NULL
		);
		CREATE UNIQUE INDEX unq_x_y ON world_cells(x, y);

		CREATE TABLE temples (
			id INTEGER PRIMARY KEY
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	return nil
}

func SeedDB() error {
	_, err := model.CreateVillage(context.Background(), 3, 4)
	if err != nil {
		return fmt.Errorf("failed to create village: %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 1, 1)
	if err != nil {
		return fmt.Errorf("failed to create temple (1,1): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 8, 1)
	if err != nil {
		return fmt.Errorf("failed to create temple (8,1): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 8, 8)
	if err != nil {
		return fmt.Errorf("failed to create temple (8,8): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 1, 8)
	if err != nil {
		return fmt.Errorf("failed to create temple (1,8): %w", err)
	}

	return nil
}

func DropDB() error {
	_, err := db.DB.Exec(`DROP TABLE IF EXISTS villages;`)
	return err
}
