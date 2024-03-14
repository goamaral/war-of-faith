package db

import (
	"context"
	"fmt"
	"reflect"

	"github.com/jmoiron/sqlx"
	_ "github.com/libsql/libsql-client-go/libsql"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	_ "modernc.org/sqlite"
)

var ErrNotFound = status.Error(codes.NotFound, "not found")

var DB *sqlx.DB
var Debug bool

func Init(uri string) error {
	var err error

	DB, err = sqlx.Open("libsql", uri)
	if err != nil {
		return fmt.Errorf("failed to open db: %w", err)
	}

	_, err = DB.Exec("PRAGMA foreign_keys = ON;")
	if err != nil {
		return fmt.Errorf("failed to enable foreign keys: %w", err)
	}

	return nil
}

func queryRowxContext(ctx context.Context, query string, args ...any) *sqlx.Row {
	if Debug {
		fmt.Println("Query:", query, args)
	}
	return DB.QueryRowxContext(ctx, query, args...)
}

func queryxContext(ctx context.Context, query string, args ...any) (*sqlx.Rows, error) {
	if Debug {
		fmt.Println("Query:", query, args)
	}
	return DB.QueryxContext(ctx, query, args...)
}

func recordToMap(record any) (map[string]any, error) {
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
