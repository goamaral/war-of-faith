package db

import (
	"context"
)

func GetWorld(ctx context.Context) World {
	return World{Width: 10, Height: 10}
}
