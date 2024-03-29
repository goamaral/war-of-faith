package jwt_ext

import (
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/require"
)

func NewTestProvider(t *testing.T) Provider {
	privKeyBytes := []byte(`-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIMPu+380curPEbzB5FmrrOAr6Th4ZmrbQfKmG1HvR4EBoAoGCCqGSM49
AwEHoUQDQgAEwgUlhc3KO/HMScHd8tzo9mX2eHKxLRY1mhTXLXsf/nmXddkJO6AV
35UALafcg5Pq0jLVAx90EPM26ANGzaMJEA==
-----END EC PRIVATE KEY-----
`)
	pubKeyBytes := []byte(`-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEwgUlhc3KO/HMScHd8tzo9mX2eHKx
LRY1mhTXLXsf/nmXddkJO6AV35UALafcg5Pq0jLVAx90EPM26ANGzaMJEA==
-----END PUBLIC KEY-----
`)

	privKey, err := jwt.ParseECPrivateKeyFromPEM(privKeyBytes)
	require.NoError(t, err)

	pubKey, err := jwt.ParseECPublicKeyFromPEM(pubKeyBytes)
	require.NoError(t, err)

	return Provider{PrivKey: privKey, PubKey: pubKey}
}
