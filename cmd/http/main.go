package main

import (
	"context"
	"fmt"

	connectgo "github.com/bufbuild/connect-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	serverv1connect "war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	serverv1.UnimplementedServiceServer
}

func (s *Server) GetEntity(ctx context.Context, req *connectgo.Request[serverv1.GetEntityRequest]) (*connectgo.Response[serverv1.GetEntityResponse], error) {
	return connectgo.NewResponse(&serverv1.GetEntityResponse{Entity: &serverv1.Entity{Id: 1}}), nil
}

func main() {
	server := gin.Default()
	server.SetTrustedProxies(nil)
	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4000"},
		AllowMethods:     []string{"POST"},
		AllowHeaders:     []string{"Origin", "Connect-Protocol-Version", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	path, handler := serverv1connect.NewServiceHandler(&Server{})
	server.Any(fmt.Sprintf("%s*w", path), gin.WrapH(handler))
	server.Run(":3000")
}
