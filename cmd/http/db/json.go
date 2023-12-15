package db

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

func JsonValue(v any) ([]byte, error) {
	return json.Marshal(v)
}

func JsonScan(dst any, value any) error {
	if value == nil {
		return nil
	}

	var valueBytes []byte
	switch v := value.(type) {
	case []byte:
		valueBytes = v
	case string:
		valueBytes = []byte(v)
	default:
		return fmt.Errorf("invalid type %T for %T", value, dst)
	}

	return json.Unmarshal(valueBytes, dst)
}

type JsonMapKey interface {
	comparable
	fmt.Stringer
}

type JsonMap[K JsonMapKey, V any] map[K]V

func (jm JsonMap[K, V]) Value() (driver.Value, error) {
	return JsonValue(jm)
}

func (jm *JsonMap[K, V]) Scan(value any) error {
	return JsonScan(jm, value)
}

func (jm JsonMap[K, V]) Get(k K) V {
	if jm == nil {
		var v V
		return v
	}
	return jm[k]
}

func (jm JsonMap[K, V]) ToProtobuf() map[string]V {
	pJsonMap := make(map[string]V, len(jm))
	for k, v := range jm {
		pJsonMap[k.String()] = v
	}
	return pJsonMap
}
