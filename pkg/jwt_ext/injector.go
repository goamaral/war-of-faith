package jwt_ext

import (
	"fmt"
	"os"
	"testing"

	"github.com/samber/do"
)

func InjectProvider(privKeyPath, pubKeyPath string) func(i *do.Injector) (Provider, error) {
	return func(i *do.Injector) (Provider, error) {
		privKeyFile, err := os.Open(privKeyPath)
		if err != nil {
			return Provider{}, fmt.Errorf("failed to open private key file: %w", err)
		}
		pubKeyFile, err := os.Open(pubKeyPath)
		if err != nil {
			return Provider{}, fmt.Errorf("failed to open public key file: %w", err)
		}
		return NewProvider(privKeyFile, pubKeyFile)
	}
}

func InjectTestProvider(t *testing.T) func(i *do.Injector) (Provider, error) {
	return func(i *do.Injector) (Provider, error) { return NewTestProvider(t), nil }
}
