package db

import (
	"context"
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
	// db = sqlx.MustOpen("sqlite", ":memory:")
	// db = sqlx.MustOpen("sqlite", ":memory:?_pragma=foreign_keys(1)")
	db = sqlx.MustOpen("sqlite", "db.sqlite3")
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
			upgrade_gold_cost INTERGER NOT NULL,
			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);
	`)

	_, err := CreateVillage(context.Background())
	if err != nil {
		log.Panic(err)
	}
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
	// TODO: User db.GetContext()
	records, err := findQuery[T](ctx, qry.Limit(1))
	if err != nil {
		return record, false, err
	}
	if len(records) == 0 {
		return record, false, nil
	}
	return records[0], true, nil
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
