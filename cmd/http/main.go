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

func (s *Server) GetVillage(ctx context.Context, req *connectgo.Request[serverv1.GetVillageRequest]) (*connectgo.Response[serverv1.GetVillageResponse], error) {
	return connectgo.NewResponse(&serverv1.GetVillageResponse{
		Village: &serverv1.Village{
			Id: 1,
			Resources: &serverv1.Village_Resources{
				Gold: 0,
			},
			Buildings: &serverv1.Village_Buildings{
				Hall: &serverv1.Building{
					Kind:            serverv1.Building_KIND_HALL,
					Level:           1,
					IsUpgradable:    true,
					UpgradeTimeLeft: 0,
					UpgradeCost: &serverv1.Building_UpgradeCost{
						Gold: 10,
					},
				},
				GoldMine: &serverv1.Building{
					Kind:            serverv1.Building_KIND_GOLD_MINE,
					Level:           1,
					IsUpgradable:    true,
					UpgradeTimeLeft: 0,
					UpgradeCost: &serverv1.Building_UpgradeCost{
						Gold: 10,
					},
				},
			},
		},
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
