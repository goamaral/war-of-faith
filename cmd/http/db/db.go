package db

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/bufbuild/connect-go"
	"github.com/jmoiron/sqlx"
	_ "github.com/libsql/libsql-client-go/libsql"
	_ "modernc.org/sqlite"
)

var ErrNotFound = connect.NewError(connect.CodeNotFound, errors.New("not found"))

var DB *sqlx.DB

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
