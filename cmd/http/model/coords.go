package model

import (
	"database/sql/driver"
	"fmt"
	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
)

type Coords struct {
	X uint32 `json:"x"`
	Y uint32 `json:"y"`
}

func (c Coords) Value() (driver.Value, error) { return db.JsonValue(c) }
func (c *Coords) Scan(value any) error        { return db.JsonScan(c, value) }

func (c Coords) String() string { return fmt.Sprintf("{\"x\":%d,\"y\":%d}", c.X, c.Y) }

func (c Coords) ToProtobuf() (*serverv1.Coords, error) {
	return &serverv1.Coords{X: c.X, Y: c.Y}, nil
}

/* PROTOBUF */
func CoordsFromProtobuf(pCoords *serverv1.Coords) (Coords, error) {
	return Coords{X: pCoords.X, Y: pCoords.Y}, nil
}
