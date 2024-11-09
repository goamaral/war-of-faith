package di

import (
	"testing"
	"war-of-faith/cmd/http/service"
	fs_ext "war-of-faith/pkg/fs_ext"
	"war-of-faith/pkg/jwt_ext"

	"github.com/samber/do"
)

func NewInjector() *do.Injector {
	i := do.New()

	/* SERVICES */
	do.Provide(i, service.NewAuthService)

	/* PROVIDERS */
	do.Provide(i, jwt_ext.InjectProvider(
		fs_ext.GetAbsolutePath("../../../secrets/ecdsa"),
		fs_ext.GetAbsolutePath("../../../secrets/ecdsa.pub"),
	))

	return i
}

func NewTestInjector(t *testing.T) *do.Injector {
	injector := NewInjector()

	do.Override(injector, jwt_ext.InjectTestProvider(t))

	return injector
}
