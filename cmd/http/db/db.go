package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"reflect"

	sq "github.com/Masterminds/squirrel"
	"github.com/bufbuild/connect-go"
	"github.com/jmoiron/sqlx"
	_ "github.com/libsql/libsql-client-go/libsql"
	"github.com/samber/lo"
	_ "modernc.org/sqlite"
)

var ErrNotFound = connect.NewError(connect.CodeNotFound, errors.New("not found"))

var db *sqlx.DB

func Init(uri string) error {
	var err error

	db, err = sqlx.Open("libsql", uri)
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	_, err = db.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	_, err = db.Exec(`
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

		CREATE TABLE IF NOT EXISTS troop_training_orders (
			id INTEGER PRIMARY KEY,
			quantity INTEGER NOT NULL,
			time_left INTEGER NOT NULL,

			troop_id INTEGER NOT NULL,
			village_id INTEGER NOT NULL,
			FOREIGN KEY(troop_id) REFERENCES troops(id),
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	return nil
}

func Seed() error {
	village, err := CreateVillage(context.Background())
	if err != nil {
		return err
	}

	fmt.Printf("Created village: %d\n", village.Id)

	return nil
}

func Drop() error {
	_, err := db.Exec(`DROP TABLE IF EXISTS villages;`)
	return err
}

func RecordToMap(record any) (map[string]any, error) {
	v := reflect.ValueOf(record)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return nil, fmt.Errorf("record must be a struct (found %s)", v.Kind().String())
	}

	recordMap := map[string]any{}
	for i := 0; i < v.NumField(); i++ {
		fieldName := v.Type().Field(i).Tag.Get("db")
		if fieldName != "" {
			recordMap[fieldName] = v.Field(i).Interface()
		}
	}

	return recordMap, nil
}

type QryExp interface {
	ToSql() (sql string, args []interface{}, err error)
}

func newQuery(exprs ...QryExp) sq.StatementBuilderType {
	if len(exprs) >= 1 {
		return sq.StatementBuilder.Where(exprs[0], lo.Map(exprs[1:], func(expr QryExp, _ int) any { return expr.(any) }))
	}
	return sq.StatementBuilder
}

func insertQuery[T any](ctx context.Context, table string, record *T) error {
	recordMap, err := RecordToMap(record)
	if err != nil {
		return fmt.Errorf("failed to convert record to map: %w", err)
	}
	delete(recordMap, "id")

	qrySql, args, err := sq.Insert(table).SetMap(recordMap).Suffix("RETURNING *").ToSql()
	if err != nil {
		return fmt.Errorf("failed to build sql query: %w", err)
	}

	return db.QueryRowxContext(ctx, qrySql, args...).StructScan(record)
}

func findQuery[T any](ctx context.Context, table string, exprs ...QryExp) ([]T, error) {
	var records []T
	qrySql, args, err := newQuery(exprs...).Select("*").From(table).ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build sql query: %w", err)
	}

	rows, err := db.QueryxContext(ctx, qrySql, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to run sql query: %w", err)
	}

	for rows.Next() {
		var record T
		err = rows.StructScan(&record)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		records = append(records, record)
	}
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("failed to scan rows: %w", err)
	}

	return records, nil
}

func firstQuery[T any](ctx context.Context, table string, exprs ...QryExp) (T, bool, error) {
	var record T

	qrySql, args, err := newQuery(exprs...).Select("*").From(table).ToSql()
	if err != nil {
		return record, false, fmt.Errorf("failed to build sql query: %w", err)
	}

	err = db.QueryRowxContext(ctx, qrySql, args...).StructScan(&record)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return record, false, nil
		}
		return record, false, err
	}

	return record, true, nil
}

func updateQuery(ctx context.Context, table string, record any, exprs ...QryExp) error {
	recordMap, err := RecordToMap(record)
	if err != nil {
		return fmt.Errorf("failed to convert record to map: %w", err)
	}

	qrySql, args, err := newQuery(exprs...).Update(table).SetMap(recordMap).ToSql()
	if err != nil {
		return fmt.Errorf("failed to build sql query: %w", err)
	}

	_, err = db.ExecContext(ctx, qrySql, args...)
	return err
}

func deleteQuery(ctx context.Context, table string, exprs ...QryExp) error {
	qrySql, args, err := newQuery(exprs...).Delete(TroopTrainingOrdersTableName).ToSql()
	if err != nil {
		return fmt.Errorf("failed to build sql query: %w", err)
	}

	_, err = db.ExecContext(ctx, qrySql, args...)
	return err
}
