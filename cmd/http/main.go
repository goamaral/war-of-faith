package main

import (
	"context"
	"fmt"

	connectgo "github.com/bufbuild/connect-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"war-of-faith/cmd/http/local"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	serverv1connect "war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	serverv1.UnimplementedServiceServer
}

func (s *Server) GetVillage(ctx context.Context, req *connectgo.Request[serverv1.GetVillageRequest]) (*connectgo.Response[serverv1.GetVillageResponse], error) {
	village, found := local.GetVillageById(req.Msg.Id.Value)
	if !found {
		return nil, fmt.Errorf("village not found")
	}

	return connectgo.NewResponse(&serverv1.GetVillageResponse{
		Village: village.ToProtobuf(),
	}), nil
}

func (s *Server) UpgradeBuilding(ctx context.Context, req *connectgo.Request[serverv1.UpgradeBuildingRequest]) (*connectgo.Response[serverv1.UpgradeBuildingResponse], error) {
	building, upgraded, err := local.UpgradeBuilding(req.Msg.VillageId, req.Msg.Kind)
	if err != nil {
		return nil, fmt.Errorf("failed to upgrade building (village_id: %d, kind: %s)", req.Msg.VillageId, req.Msg.Kind)
	}

	return connectgo.NewResponse(&serverv1.UpgradeBuildingResponse{
		Building: building.ToProtobuf(),
		Upgraded: upgraded,
	}), nil
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
