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

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE IF NOT EXISTS building_upgrade_orders (
			id INTEGER PRIMARY KEY,
			level INTEGER NOT NULL,
			time_left INTEGER NOT NULL,

			building_id INTEGER NOT NULL,
			village_id INTEGER NOT NULL, -- TODO: Remove when joins are implemented
			FOREIGN KEY(building_id) REFERENCES buildings(id),
			FOREIGN KEY(village_id) REFERENCES villages(id) -- TODO: Remove when joins are implemented
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
			village_id INTEGER NOT NULL, -- TODO: Remove when joins are implemented
			FOREIGN KEY(troop_id) REFERENCES troops(id),
			FOREIGN KEY(village_id) REFERENCES villages(id) -- TODO: Remove when joins are implemented
		);

		CREATE TABLE IF NOT EXISTS world_cells (
			coords TEXT PRIMARY KEY,
			x INTEGER NOT NULL,
			y INTEGER NOT NULL,
			entity_kind INTERGER NOT NULL,
			entity_id INTEGER NOT NULL
		);
		CREATE UNIQUE INDEX IF NOT EXISTS unq_x_y ON world_cells(x, y);

		CREATE TABLE IF NOT EXISTS temples (
			id INTEGER PRIMARY KEY
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	return nil
}

func Seed() error {
	_, err := CreateVillage(context.Background(), 3, 4)
	if err != nil {
		return fmt.Errorf("failed to create village: %w", err)
	}
	_, err = CreateTemple(context.Background(), 1, 1)
	if err != nil {
		return fmt.Errorf("failed to create temple (1,1): %w", err)
	}
	_, err = CreateTemple(context.Background(), 8, 1)
	if err != nil {
		return fmt.Errorf("failed to create temple (8,1): %w", err)
	}
	_, err = CreateTemple(context.Background(), 8, 8)
	if err != nil {
		return fmt.Errorf("failed to create temple (8,8): %w", err)
	}
	_, err = CreateTemple(context.Background(), 1, 8)
	if err != nil {
		return fmt.Errorf("failed to create temple (1,8): %w", err)
	}

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

type QueryOption sq.Sqlizer

type OrderQueryOption struct {
	Column string
	Desc   bool
}

func (o OrderQueryOption) ToSql() (string, []any, error) {
	sql := o.Column
	if o.Desc {
		return sql + " DESC", nil, nil
	}
	return sql + " ASC", nil, nil
}

func applySelectQueryOptions(qry sq.SelectBuilder, opts ...QueryOption) (sq.Sqlizer, error) {
	for _, opt := range opts {
		switch o := opt.(type) {
		case OrderQueryOption:
			qry = qry.OrderByClause(o)
		case sq.Sqlizer:
			qry = qry.Where(o)
		default:
			return qry, fmt.Errorf("select queries do not support query options of kind %T", opt)
		}
	}
	return qry, nil
}

func applyUpdateQueryOptions(qry sq.UpdateBuilder, opts ...QueryOption) (sq.Sqlizer, error) {
	for _, opt := range opts {
		switch o := opt.(type) {
		case sq.Sqlizer:
			qry = qry.Where(o)
		default:
			return qry, fmt.Errorf("update queries do not support query options of kind %T", opt)
		}
	}
	return qry, nil
}

func applyDeleteQueryOptions(qry sq.DeleteBuilder, opts ...QueryOption) (sq.Sqlizer, error) {
	for _, opt := range opts {
		switch o := opt.(type) {
		case sq.Sqlizer:
			qry = qry.Where(o)
		default:
			return qry, fmt.Errorf("delete queries do not support query options of kind %T", opt)
		}
	}
	return qry, nil
}

func insertQuery[T any](ctx context.Context, table string, record *T) error {
	recordMap, err := RecordToMap(record)
	if err != nil {
		return fmt.Errorf("failed to convert record to map: %w", err)
	}
	delete(recordMap, "id")

	qrySql := fmt.Sprintf("INSERT INTO %s DEFAULT VALUES RETURNING *", table)
	var args []any
	if len(recordMap) != 0 {
		qrySql, args, err = sq.Insert(table).SetMap(recordMap).Suffix("RETURNING *").ToSql()
		if err != nil {
			return fmt.Errorf("failed to build sql query: %w", err)
		}
	}

	return db.QueryRowxContext(ctx, qrySql, args...).StructScan(record)
}

func findQuery[T any](ctx context.Context, table string, opts ...QueryOption) ([]T, error) {
	var records []T
	qry, err := applySelectQueryOptions(sq.Select("*").From(table), opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
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

func firstQuery[T any](ctx context.Context, table string, opts ...QueryOption) (T, bool, error) {
	var record T

	qry, err := applySelectQueryOptions(sq.Select("*").From(table), opts...)
	if err != nil {
		return record, false, fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
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

func updateQuery(ctx context.Context, table string, record any, opts ...QueryOption) error {
	recordMap, err := RecordToMap(record)
	if err != nil {
		return fmt.Errorf("failed to convert record to map: %w", err)
	}

	qry, err := applyUpdateQueryOptions(sq.Update(table).SetMap(recordMap), opts...)
	if err != nil {
		return fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build sql query: %w", err)
	}

	_, err = db.ExecContext(ctx, qrySql, args...)
	return err
}

func deleteQuery(ctx context.Context, table string, opts ...QueryOption) error {
	qry, err := applyDeleteQueryOptions(sq.Delete(table), opts...)
	if err != nil {
		return fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build sql query: %w", err)
	}

	_, err = db.ExecContext(ctx, qrySql, args...)
	return err
}
