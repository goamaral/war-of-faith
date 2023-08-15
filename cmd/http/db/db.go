package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/sqlite3"
	_ "github.com/glebarez/go-sqlite"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB
var dialect goqu.DialectWrapper

func init() {
	db = sqlx.MustOpen("sqlite", ":memory:")
	// db = sqlx.MustOpen("sqlite", "db.sqlite3")
	dialect = goqu.Dialect("sqlite3")

	db.MustExec("PRAGMA foreign_keys = ON;")
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS villages (
			id INTEGER PRIMARY KEY,
			gold INTERGER NOT NULL
		);

		CREATE TABLE IF NOT EXISTS buildings (
			id INTEGER PRIMARY KEY,
			kind INTERGER NOT NULL,
			level INTERGER NOT NULL,
			upgrade_time_left INTERGER NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE IF NOT EXISTS troops (
			id INTEGER PRIMARY KEY,
			kind INTERGER NOT NULL,
			name TEXT NOT NULL,
			quantity INTEGER NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);
	`)

	ctx := context.Background()

	village, err := CreateVillage(ctx)
	if err != nil {
		log.Panic(err)
	}
	fmt.Println(village)
}

func findQuery[T any](ctx context.Context, qry *goqu.SelectDataset) ([]T, error) {
	var records []T
	sql, params, err := qry.ToSQL()
	if err != nil {
		return []T{}, fmt.Errorf("failed to build query: %w", err)
	}
	return records, db.SelectContext(ctx, &records, sql, params...)
}

func firstQuery[T any](ctx context.Context, qry *goqu.SelectDataset) (T, bool, error) {
	var record T
	qrySql, params, err := qry.ToSQL()
	if err != nil {
		return record, false, fmt.Errorf("failed to build query: %w", err)
	}
	err = db.GetContext(ctx, &record, qrySql, params...)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return record, false, nil
		}
		return record, false, err
	}
	return record, true, nil
}

func updateQuery(ctx context.Context, qry *goqu.UpdateDataset) (int64, error) {
	sql, params, err := qry.ToSQL()
	if err != nil {
		return 0, fmt.Errorf("failed to build query: %w", err)
	}
	res, err := db.ExecContext(ctx, sql, params...)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func insertQuery(ctx context.Context, qry *goqu.InsertDataset) (int64, error) {
	sql, params, err := qry.ToSQL()
	if err != nil {
		return 0, fmt.Errorf("failed to build query: %w", err)
	}
	res, err := db.ExecContext(ctx, sql, params...)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}
