package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	sq "github.com/Masterminds/squirrel"
)

func Insert[T any](ctx context.Context, table string, record *T) error {
	recordMap, err := recordToMap(record)
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

	return DB.QueryRowxContext(ctx, qrySql, args...).StructScan(record)
}

func Find[T any](ctx context.Context, table string, opts ...QueryOption) ([]T, error) {
	var records []T
	qry, err := applySelectQueryOptions(sq.Select("*").From(table), opts...)
	if err != nil {
		return nil, fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
	if err != nil {
		return nil, fmt.Errorf("failed to build sql query: %w", err)
	}

	rows, err := DB.QueryxContext(ctx, qrySql, args...)
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

func FindOne[T any](ctx context.Context, table string, opts ...QueryOption) (T, bool, error) {
	var record T

	qry, err := applySelectQueryOptions(sq.Select("*").From(table), opts...)
	if err != nil {
		return record, false, fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
	if err != nil {
		return record, false, fmt.Errorf("failed to build sql query: %w", err)
	}

	err = DB.QueryRowxContext(ctx, qrySql, args...).StructScan(&record)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return record, false, nil
		}
		return record, false, err
	}

	return record, true, nil
}

func First[T any](ctx context.Context, table string, opts ...QueryOption) (T, error) {
	var record T

	qry, err := applySelectQueryOptions(sq.Select("*").From(table), opts...)
	if err != nil {
		return record, fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
	if err != nil {
		return record, fmt.Errorf("failed to build sql query: %w", err)
	}

	err = DB.QueryRowxContext(ctx, qrySql, args...).StructScan(&record)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return record, nil
		}
		return record, err
	}

	return record, nil
}

func Update(ctx context.Context, table string, record any, opts ...QueryOption) error {
	recordMap, err := recordToMap(record)
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

	_, err = DB.ExecContext(ctx, qrySql, args...)
	return err
}

func Delete(ctx context.Context, table string, opts ...QueryOption) error {
	qry, err := applyDeleteQueryOptions(sq.Delete(table), opts...)
	if err != nil {
		return fmt.Errorf("failed to apply query options: %w", err)
	}

	qrySql, args, err := qry.ToSql()
	if err != nil {
		return fmt.Errorf("failed to build sql query: %w", err)
	}

	_, err = DB.ExecContext(ctx, qrySql, args...)
	return err
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
