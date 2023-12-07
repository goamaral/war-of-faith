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
	"github.com/samber/lo"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"war-of-faith/cmd/http/db"
	"war-of-faith/cmd/http/model"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	"war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	serverv1.UnimplementedServiceServer
}

/* VILLAGES */
func (s *Server) GetVillage(ctx context.Context, req *connect.Request[serverv1.GetVillageRequest]) (*connect.Response[serverv1.GetVillageResponse], error) {
	village, found, err := model.GetVillage(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Errorf(codes.NotFound, "village (id: %d) not found", req.Msg.Id)
	}

	pVillage, err := village.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert village to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetVillageResponse{Village: pVillage}), nil
}

/* ORDERS */
// TODO: Use mutexes and transaction
func (s *Server) IssueBuildingUpgradeOrder(ctx context.Context, req *connect.Request[serverv1.IssueBuildingUpgradeOrderRequest]) (*connect.Response[serverv1.IssueBuildingUpgradeOrderResponse], error) {
	building, found, err := model.GetBuilding(ctx, req.Msg.BuildingId)
	if err != nil {
		return nil, fmt.Errorf("failed to get building: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "building not found")
	}

	nextUpgradeLevel, err := building.NextUpgradeLevel(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get building (id: %d) next upgrade level: %w", building.Id, err)
	}
	if nextUpgradeLevel > model.PlaceholderBuildingMaxLevel {
		return nil, status.Error(codes.FailedPrecondition, "building is already at max level")
	}

	village, err := building.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	cost := model.CalculateBuildingUpgradeCost(nextUpgradeLevel)
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}

	village.SpendResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	order, err := model.CreateBuildingUpgradeOrder(ctx, &model.BuildingUpgradeOrder{
		Level:      nextUpgradeLevel,
		TimeLeft:   cost.Time,
		BuildingId: building.Id,
		VillageId:  village.Id, // TODO: Remove when joins are implemented
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create building upgrade order: %w", err)
	}

	pOrder, err := order.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert building upgrade order to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.IssueBuildingUpgradeOrderResponse{Order: pOrder}), nil
}

// TODO: Use mutexes and transaction
func (s *Server) CancelBuildingUpgradeOrder(ctx context.Context, req *connect.Request[serverv1.CancelBuildingUpgradeOrderRequest]) (*connect.Response[serverv1.CancelBuildingUpgradeOrderResponse], error) {
	order, found, err := model.GetBuildingUpgradeOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get building upgrade order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "building upgrade order not found")
	}

	orders, err := model.GetBuildingUpgradeOrders(ctx, sq.Eq{"building_id": order.BuildingId}, db.OrderQueryOption{Column: "level", Desc: true})
	if err != nil {
		return nil, fmt.Errorf("failed to get building (id: %d) upgrade orders: %w", order.BuildingId, err)
	}
	if order.Id != orders[0].Id {
		return nil, status.Error(codes.FailedPrecondition, "building upgrade order is not the latest order")
	}

	building, err := order.Building(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get building (id: %d): %w", order.BuildingId, err)
	}

	village, err := building.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}

	cost := model.CalculateBuildingUpgradeCost(order.Level)
	village.EarnResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	err = model.DeleteBuildingUpgradeOrder(ctx, order.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete building upgrade order: %w", err)
	}

	return connect.NewResponse(&serverv1.CancelBuildingUpgradeOrderResponse{}), nil
}

// TODO: Use mutexes and transaction
func (s *Server) IssueTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.IssueTroopTrainingOrderRequest]) (*connect.Response[serverv1.IssueTroopTrainingOrderResponse], error) {
	troop, found, err := model.GetTroop(ctx, req.Msg.TroopId)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop not found")
	}

	village, err := troop.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}

	cost := model.CalculateTrainCost(req.Msg.Quantity)
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}
	if troop.Kind == serverv1.Troop_KIND_LEADER {
		if troop.Quantity > 0 {
			return nil, status.Error(codes.FailedPrecondition, "no more leaders can be trained")
		}

		orders, err := model.GetTroopTrainingOrders(ctx, sq.Eq{"troop_id": troop.Id})
		if err != nil {
			return nil, fmt.Errorf("failed to get troop training orders: %w", err)
		}
		if len(orders) > 0 {
			return nil, status.Error(codes.FailedPrecondition, "no more leaders can be trained")
		}
	}

	village.SpendResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	order, err := model.CreateTroopTrainingOrder(ctx, &model.TroopTrainingOrder{
		Quantity:  req.Msg.Quantity,
		TimeLeft:  cost.Time,
		TroopId:   req.Msg.TroopId,
		VillageId: village.Id, // TODO: Remove when joins are implemented
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
	order, found, err := model.GetTroopTrainingOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop training order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop training order not found")
	}

	troop, err := order.Troop(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop (id: %d): %w", order.TroopId, err)
	}

	village, err := troop.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village (id: %d): %w", troop.VillageId, err)
	}

	cost := model.CalculateTrainCost(order.Quantity)
	village.EarnResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	err = model.DeleteTroopTrainingOrder(ctx, order.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to delete troop training order: %w", err)
	}

	return connect.NewResponse(&serverv1.CancelTroopTrainingOrderResponse{}), nil
}

/* WORLD */
func (s *Server) GetWorld(ctx context.Context, req *connect.Request[serverv1.GetWorldRequest]) (*connect.Response[serverv1.GetWorldResponse], error) {
	world := model.GetWorld(ctx)

	pWorld, err := world.ToProtobuf(ctx, req.Msg.LoadCells)
	if err != nil {
		return nil, fmt.Errorf("failed to convert world to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetWorldResponse{World: pWorld}), nil
}

func main() {
	createDB := flag.Bool("db-create", false, "creates database")
	recreateDB := flag.Bool("db-recreate", false, "recreates database")
	seedDB := flag.Bool("db-seed", false, "seeds database")
	dbUri := flag.String("db-uri", "file:db.sqlite3", "database uri")
	flag.Parse()

	err := db.Init(*dbUri)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}

	if *recreateDB {
		err := DropDB()
		if err != nil {
			log.Fatalf("failed to drop database: %v", err)
		}
	}

	if *recreateDB || *createDB {
		err := CreateDB()
		if err != nil {
			log.Fatalf("failed to drop database: %v", err)
		}
	}

	if *seedDB {
		err := SeedDB()
		if err != nil {
			log.Fatalf("failed to seed database: %v", err)
		}
	}

	go runServer()

	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		ctx := context.Background()

		// TODO: Use mutexes and transaction
		villages, err := model.GetVillages(ctx)
		if err != nil {
			log.Printf("failed to get villages: %v", err)
			continue
		}
		for _, village := range villages {
			buildings, err := model.GetBuildings(ctx, sq.Eq{"village_id": village.Id})
			if err != nil {
				log.Printf("failed to get buildings (village_id: %d): %v", village.Id, err)
				continue
			}
			buildingIds := lo.Map(buildings, func(b model.Building, _ int) uint32 { return b.Id })
			buildingUpgradeOrders, err := model.GetBuildingUpgradeOrders(ctx, sq.Eq{"building_id": buildingIds})
			if err != nil {
				log.Printf("failed to get building (ids: %+v) upgrade orders: %v", buildingIds, err)
				continue
			}
			for _, order := range buildingUpgradeOrders {
				order.TimeLeft--
				if order.TimeLeft == 0 {
					err := model.DeleteBuildingUpgradeOrder(ctx, order.Id)
					if err != nil {
						log.Printf("failed to delete building upgrade order (id: %d): %v", order.Id, err)
						continue
					}
					building, found, err := model.GetBuilding(ctx, order.BuildingId)
					if err != nil {
						log.Printf("failed to get building (id: %d): %v", order.BuildingId, err)
						continue
					}
					if !found {
						log.Printf("building not found (id: %d)", order.BuildingId)
						continue
					}

					building.Level = order.Level
					err = model.UpdateBuilding(ctx, building.Id, building)
					if err != nil {
						log.Printf("failed to update building (id: %d): %v", building.Id, err)
						continue
					}
				} else {
					err := model.UpdateBuildingUpgradeOrder(ctx, order.Id, order)
					if err != nil {
						log.Printf("failed to update building training order (id: %d): %v", order.Id, err)
						continue
					}
				}
			}

			troops, err := model.GetTroops(ctx, sq.Eq{"village_id": village.Id})
			if err != nil {
				log.Printf("failed to get troops (village_id: %d): %v", village.Id, err)
				continue
			}
			troopIds := lo.Map(troops, func(t model.Troop, _ int) uint32 { return t.Id })
			troopTrainingOrders, err := model.GetTroopTrainingOrders(ctx, sq.Eq{"troop_id": troopIds})
			if err != nil {
				log.Printf("failed to get troop (ids: %+v) training orders: %v", troopIds, err)
				continue
			}
			for _, order := range troopTrainingOrders {
				order.TimeLeft--
				if order.TimeLeft == 0 {
					err := model.DeleteTroopTrainingOrder(ctx, order.Id)
					if err != nil {
						log.Printf("failed to delete troop training order (id: %d): %v", order.Id, err)
						continue
					}
					troop, found, err := model.GetTroop(ctx, order.TroopId)
					if err != nil {
						log.Printf("failed to get troop (id: %d): %v", order.TroopId, err)
						continue
					}
					if !found {
						log.Printf("troop not found (id: %d)", order.TroopId)
						continue
					}

					troop.Quantity += order.Quantity
					err = model.UpdateTroop(ctx, troop.Id, troop)
					if err != nil {
						log.Printf("failed to update troop (id: %d): %v", troop.Id, err)
						continue
					}
				} else {
					err := model.UpdateTroopTrainingOrder(ctx, order.Id, order)
					if err != nil {
						log.Printf("failed to update troop training order (id: %d): %v", order.Id, err)
						continue
					}
				}
			}

			village.Gold++
			err = model.UpdateVillage(ctx, village.Id, village)
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
