package server

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"
	"war-of-faith/cmd/http/server/helper"
	"war-of-faith/cmd/http/service"
	publicv1 "war-of-faith/pkg/protobuf/public/v1"
	publicv1connect "war-of-faith/pkg/protobuf/public/v1/publicv1connect"

	"connectrpc.com/connect"
	"github.com/gin-gonic/gin"
	"github.com/samber/do"
)

const AccessTokenHeader = "Access-Token"
const RefreshTokenHeader = "Refresh-Token"

type PublicV1Server struct {
	authSvc service.AuthService
}

func (s PublicV1Server) Login(ctx context.Context, req *connect.Request[publicv1.LoginRequest]) (*connect.Response[publicv1.LoginResponse], error) {
	var playerId uint
	switch req.Msg.Email {
	case "player1":
		playerId = 1
	case "player2":
		playerId = 2
	default:
		return nil, connect.NewError(connect.CodeFailedPrecondition, errors.New("invalid credentials"))
	}

	accessToken, err := s.authSvc.GenerateAccessToken(playerId)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	refreshToken, err := s.authSvc.GenerateRefreshToken(playerId)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	res := connect.NewResponse(&publicv1.LoginResponse{})
	res.Header().Add(AccessTokenHeader, accessToken)
	res.Header().Add(RefreshTokenHeader, refreshToken)

	return res, nil
}

type WrappedWriteWriter struct {
	http.ResponseWriter
	BeforeWriteFn func()
}

func (w WrappedWriteWriter) Write(data []byte) (int, error) {
	w.BeforeWriteFn()
	return w.ResponseWriter.Write(data)
}

func NewPublicV1Server(ginEngine *gin.Engine, i *do.Injector) {
	path, handler := publicv1connect.NewServiceHandler(
		PublicV1Server{
			authSvc: do.MustInvoke[service.AuthService](i),
		},
		connect.WithInterceptors(
			// helper.ValidationInterceptor(do.MustInvoke[*protovalidate.Validator](i)),
			helper.GRPCStatusToConnectStatusInterceptor(),
		),
	)
	ginEngine.Any(
		fmt.Sprintf("%s*w", path),
		func(c *gin.Context) {
			handler.ServeHTTP(WrappedWriteWriter{
				ResponseWriter: c.Writer,
				BeforeWriteFn: func() {
					if c.Request.URL.Path == publicv1connect.ServiceLoginProcedure && c.Writer.Status() == http.StatusOK {
						http.SetCookie(c.Writer, &http.Cookie{
							Name:     AccessTokenHeader,
							Value:    c.Writer.Header().Get(AccessTokenHeader),
							MaxAge:   int(service.AccessTokenDuration / time.Second),
							Secure:   true,
							HttpOnly: true,
						})
						http.SetCookie(c.Writer, &http.Cookie{
							Name:     RefreshTokenHeader,
							Value:    c.Writer.Header().Get(RefreshTokenHeader),
							MaxAge:   int(service.RefreshTokenDuration / time.Second),
							Secure:   true,
							HttpOnly: true,
						})
					}
				},
			}, c.Request)
		},
	)
}
