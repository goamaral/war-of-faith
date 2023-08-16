package main

import (
	"context"
	"fmt"
	"log"
	"time"

	connectgo "github.com/bufbuild/connect-go"
	"github.com/doug-martin/goqu/v9/exp"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	serverv1connect "war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	serverv1.UnimplementedServiceServer
}

func (s *Server) GetVillage(ctx context.Context, req *connectgo.Request[serverv1.GetVillageRequest]) (*connectgo.Response[serverv1.GetVillageResponse], error) {
	village, found, err := db.GetVillage(ctx, exp.Ex{"id": req.Msg.Id.Value})
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	pVillage, err := village.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert village to protobuf: %w", err)
	}

	return connectgo.NewResponse(&serverv1.GetVillageResponse{Village: pVillage}), nil
}

// TODO: Use mutexes
func (s *Server) UpgradeBuilding(ctx context.Context, req *connectgo.Request[serverv1.UpgradeBuildingRequest]) (*connectgo.Response[serverv1.UpgradeBuildingResponse], error) {
	building, found, err := db.GetBuilding(ctx, exp.Ex{"id": req.Msg.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to get building: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "building not found")
	}

	upgradeStatus, err := building.UpgradeStatus(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check upgrade status: %w", err)
	}
	if upgradeStatus == serverv1.Building_UPGRADE_STATUS_UPGRADABLE {
		village, err := building.Village(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get village: %w", err)
		}
		village.Gold -= db.BuildingUpgradeCost.Gold
		err = db.UpdateVillage(ctx, village.Id, village)
		if err != nil {
			return nil, fmt.Errorf("failed to update village: %w", err)
		}

		building.UpgradeTimeLeft = db.BuildingUpgradeCost.Time
		err = db.UpdateBuilding(ctx, building.Id, building)
		if err != nil {
			return nil, fmt.Errorf("failed to update building: %w", err)
		}
	}

	pBuilding, err := building.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert building to protobuf: %w", err)
	}

	return connectgo.NewResponse(&serverv1.UpgradeBuildingResponse{Building: pBuilding}), nil
}

// TODO: Use mutexes
func (s *Server) CancelUpgradeBuilding(ctx context.Context, req *connectgo.Request[serverv1.CancelUpgradeBuildingRequest]) (*connectgo.Response[serverv1.CancelUpgradeBuildingResponse], error) {
	building, found, err := db.GetBuilding(ctx, exp.Ex{"id": req.Msg.Id})
	if err != nil {
		return nil, fmt.Errorf("failed to get building: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "building not found")
	}

	upgradeStatus, err := building.UpgradeStatus(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to check upgrade status: %w", err)
	}
	if upgradeStatus == serverv1.Building_UPGRADE_STATUS_UPGRADING {
		building.UpgradeTimeLeft = 0
		err = db.UpdateBuilding(ctx, building.Id, building)
		if err != nil {
			return nil, fmt.Errorf("failed to update building: %w", err)
		}

		village, err := building.Village(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to get village: %w", err)
		}
		village.Gold += db.BuildingUpgradeCost.Gold
		err = db.UpdateVillage(ctx, village.Id, village)
		if err != nil {
			return nil, fmt.Errorf("failed to update village: %w", err)
		}
	}

	pBuilding, err := building.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert building to protobuf: %w", err)
	}

	return connectgo.NewResponse(&serverv1.CancelUpgradeBuildingResponse{Building: pBuilding}), nil
}

// TODO: Use mutexes
func (s *Server) IssueTroopTrainingOrder(ctx context.Context, req *connectgo.Request[serverv1.IssueTroopTrainingOrderRequest]) (*connectgo.Response[serverv1.IssueTroopTrainingOrderResponse], error) {
	troop, found, err := db.GetTroop(ctx, exp.Ex{"id": req.Msg.TroopId})
	if err != nil {
		return nil, fmt.Errorf("failed to get troop: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop not found")
	}

	cost := troop.TrainCost(req.Msg.Quantity)
	village, err := troop.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}

	if troop.Kind == serverv1.Troop_KIND_LEADER {
		if troop.Quantity > 0 {
			return nil, status.Error(codes.FailedPrecondition, "no more leaders can be trained")
		}

		orders, err := db.GetTroopTrainingOrders(ctx, exp.Ex{"troop_id": troop.Id})
		if err != nil {
			return nil, fmt.Errorf("failed to get troop training orders: %w", err)
		}
		if len(orders) > 0 {
			return nil, status.Error(codes.FailedPrecondition, "no more leaders can be trained")
		}
	}

	village.SpendResources(cost)
	err = db.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	order, err := db.CreateTroopTrainingOrder(ctx, &db.TroopTrainingOrder{
		Quantity:  req.Msg.Quantity,
		TimeLeft:  db.TroopTrainCost.Time,
		TroopId:   req.Msg.TroopId,
		VillageId: village.Id,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create troop training order: %w", err)
	}

	pOrder, err := order.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert troop training order to protobuf: %w", err)
	}

	return connectgo.NewResponse(&serverv1.IssueTroopTrainingOrderResponse{Order: pOrder}), nil
}

func main() {
	go runServer()

	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		ctx := context.Background()

		// TODO: Use mutexes
		villages, err := db.GetVillages(ctx)
		if err != nil {
			log.Printf("failed to get villages: %v", err)
			continue
		}
		for _, village := range villages {
			buildings, err := village.Buildings(ctx)
			if err != nil {
				log.Printf("failed to get village (id: %d) buildings: %v", village.Id, err)
				continue
			}
			for _, building := range buildings {
				if building.UpgradeTimeLeft > 0 {
					building.UpgradeTimeLeft--
					if building.UpgradeTimeLeft == 0 {
						building.Level++
					}

					err = db.UpdateBuilding(ctx, building.Id, building)
					if err != nil {
						log.Printf("failed to update building (id: %d): %v", building.Id, err)
						continue
					}
				}
			}

			troopTrainingOrders, err := village.TroopTrainingOrders(ctx)
			if err != nil {
				log.Printf("failed to get village (id: %d) troop training orders: %v", village.Id, err)
				continue
			}
			for _, order := range troopTrainingOrders {
				order.TimeLeft--
				if order.TimeLeft == 0 {
					err := db.DeleteTroopTrainingOrder(ctx, exp.Ex{"id": order.Id})
					if err != nil {
						log.Printf("failed to delete troop training order (id: %d): %v", order.Id, err)
						continue
					}
					troop, found, err := db.GetTroop(ctx, exp.Ex{"id": order.TroopId})
					if err != nil {
						log.Printf("failed to get troop (id: %d): %v", order.TroopId, err)
						continue
					}
					if !found {
						log.Printf("troop not found (id: %d)", order.TroopId)
						continue
					}

					troop.Quantity += order.Quantity
					err = db.UpdateTroop(ctx, troop.Id, troop)
					if err != nil {
						log.Printf("failed to update troop (id: %d): %v", troop.Id, err)
						continue
					}
				} else {
					err := db.UpdateTroopTrainingOrder(ctx, order.Id, order)
					if err != nil {
						log.Printf("failed to update troop training order (id: %d): %v", order.Id, err)
						continue
					}
				}
			}

			village.Gold++
			err = db.UpdateVillage(ctx, village.Id, village)
			if err != nil {
				log.Printf("failed to update village (id: %d): %v", village.Id, err)
				continue
			}
		}
	}
}

func runServer() {
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
