package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"time"

	sq "github.com/Masterminds/squirrel"
	"github.com/bufbuild/connect-go"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"war-of-faith/cmd/http/db"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	"war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	serverv1.UnimplementedServiceServer
}

func (s *Server) GetVillage(ctx context.Context, req *connect.Request[serverv1.GetVillageRequest]) (*connect.Response[serverv1.GetVillageResponse], error) {
	village, found, err := db.GetVillage(ctx, req.Msg.Id.Value)
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

	return connect.NewResponse(&serverv1.GetVillageResponse{Village: pVillage}), nil
}

// TODO: Use mutexes and transaction
func (s *Server) UpgradeBuilding(ctx context.Context, req *connect.Request[serverv1.UpgradeBuildingRequest]) (*connect.Response[serverv1.UpgradeBuildingResponse], error) {
	building, found, err := db.GetBuilding(ctx, req.Msg.Id)
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

	return connect.NewResponse(&serverv1.UpgradeBuildingResponse{Building: pBuilding}), nil
}

// TODO: Use mutexes and transaction
func (s *Server) CancelUpgradeBuilding(ctx context.Context, req *connect.Request[serverv1.CancelUpgradeBuildingRequest]) (*connect.Response[serverv1.CancelUpgradeBuildingResponse], error) {
	building, found, err := db.GetBuilding(ctx, req.Msg.Id)
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

	return connect.NewResponse(&serverv1.CancelUpgradeBuildingResponse{Building: pBuilding}), nil
}

// TODO: Use mutexes and transaction
func (s *Server) IssueTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.IssueTroopTrainingOrderRequest]) (*connect.Response[serverv1.IssueTroopTrainingOrderResponse], error) {
	troop, found, err := db.GetTroop(ctx, req.Msg.TroopId)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop not found")
	}

	cost := db.CalculateTrainCost(req.Msg.Quantity)
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

		orders, err := db.GetTroopTrainingOrders(ctx, sq.Eq{"troop_id": troop.Id})
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

	return connect.NewResponse(&serverv1.IssueTroopTrainingOrderResponse{Order: pOrder}), nil
}

// TODO: Use mutexes and transaction
func (s *Server) CancelTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.CancelTroopTrainingOrderRequest]) (*connect.Response[serverv1.CancelTroopTrainingOrderResponse], error) {
	order, found, err := db.GetTroopTrainingOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop training order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop training order not found")
	}

	cost := db.CalculateTrainCost(order.Quantity)
	village, err := order.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	village.EarnResources(cost)
	err = db.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	err = db.DeleteTroopTrainingOrder(ctx, order.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete troop training order: %w", err)
	}

	return connect.NewResponse(&serverv1.CancelTroopTrainingOrderResponse{}), nil
}

func main() {
	seedDb := flag.Bool("db-seed", false, "seeds database")
	dropDb := flag.Bool("db-drop", false, "drops database")
	dbUri := flag.String("db-uri", "file:db.sqlite3", "database uri")
	flag.Parse()

	err := db.Init(*dbUri)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	if *dropDb {
		err := db.Drop()
		if err != nil {
			log.Fatalf("failed to drop database: %v", err)
		}
	}

	if *seedDb {
		err := db.Seed()
		if err != nil {
			log.Fatalf("failed to seed database: %v", err)
		}
	}

	go runServer()

	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		ctx := context.Background()

		// TODO: Use mutexes and transaction
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
					err := db.DeleteTroopTrainingOrder(ctx, order.Id)
					if err != nil {
						log.Printf("failed to delete troop training order (id: %d): %v", order.Id, err)
						continue
					}
					troop, found, err := db.GetTroop(ctx, order.TroopId)
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

func ExtractStatusCodeInterceptor() connect.UnaryInterceptorFunc {
	return connect.UnaryInterceptorFunc(func(next connect.UnaryFunc) connect.UnaryFunc {
		return connect.UnaryFunc(func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			res, err := next(ctx, req)
			if code := status.Code(err); code != codes.OK {
				return nil, connect.NewError(connect.Code(code), err)
			}
			return res, err
		})
	})
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

	path, handler := serverv1connect.NewServiceHandler(
		&Server{},
		connect.WithInterceptors(ExtractStatusCodeInterceptor()),
	)
	server.Any(fmt.Sprintf("%s*w", path), gin.WrapH(handler))
	server.Run(":3000")
}
