package state

import "errors"

var (
	ErrVillageNotFound = errors.New("village not found")
	ErrNotYourVillage  = errors.New("not your village")
)
