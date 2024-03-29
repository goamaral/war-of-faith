package service

import (
	"strconv"
	"time"
	"war-of-faith/pkg/jwt_ext"

	"github.com/golang-jwt/jwt/v5"
	"github.com/samber/do"
)

type TokenKind string

const (
	AccessTokenDuration  = 30 * time.Minute
	RefreshTokenDuration = 24 * time.Hour

	TokenKind_ACCESS  TokenKind = "access"
	TokenKind_REFRESH TokenKind = "refresh"
)

type AuthService struct {
	jwtProvider jwt_ext.Provider
}

func NewAuthService(i *do.Injector) (AuthService, error) {
	return AuthService{
		jwtProvider: do.MustInvoke[jwt_ext.Provider](i),
	}, nil
}

func (s AuthService) GenerateAccessToken(playerId uint) (string, error) {
	return s.jwtProvider.GenerateSignedToken(jwt.MapClaims{
		"kind": TokenKind_ACCESS,
		"sub":  strconv.Itoa(int(playerId)),
		"exp":  jwt.NewNumericDate(time.Now().Add(AccessTokenDuration)),
		"iat":  jwt.NewNumericDate(time.Now()),
	})
}

func (s AuthService) GenerateRefreshToken(playerId uint) (string, error) {
	return s.jwtProvider.GenerateSignedToken(jwt.MapClaims{
		"kind": TokenKind_REFRESH,
		"sub":  strconv.Itoa(int(playerId)),
		"exp":  jwt.NewNumericDate(time.Now().Add(RefreshTokenDuration)),
		"iat":  jwt.NewNumericDate(time.Now()),
	})
}
