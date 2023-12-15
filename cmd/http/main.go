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

func (s *Server) GetVillages(ctx context.Context, req *connect.Request[serverv1.GetVillagesRequest]) (*connect.Response[serverv1.GetVillagesResponse], error) {
	villages, err := model.GetVillages(ctx, sq.Eq{"player_id": req.Msg.PlayerId})
	if err != nil {
		return nil, fmt.Errorf("failed to get villages: %w", err)
	}

	pVillages := make([]*serverv1.Village, len(villages))
	for i, v := range villages {
		pVillage, err := v.ToProtobuf(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to convert village to protobuf: %w", err)
		}
		pVillages[i] = pVillage
	}

	return connect.NewResponse(&serverv1.GetVillagesResponse{Villages: pVillages}), nil
}

/* BUILDINGS */
func (s *Server) GetBuildings(ctx context.Context, req *connect.Request[serverv1.GetBuildingsRequest]) (*connect.Response[serverv1.GetBuildingsResponse], error) {
	return connect.NewResponse(&serverv1.GetBuildingsResponse{
		Buildings: lo.Map(model.BuildingKinds, func(t model.Building_Kind, _ int) *serverv1.Building { return t.ToBuildingProtobuf() }),
	}), nil
}

func (s *Server) IssueBuildingUpgradeOrder(ctx context.Context, req *connect.Request[serverv1.IssueBuildingUpgradeOrderRequest]) (*connect.Response[serverv1.IssueBuildingUpgradeOrderResponse], error) {
	village, found, err := model.GetVillage(ctx, req.Msg.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	buildingKind, err := model.Building_KindFromProtobuf(req.Msg.BuildingKind)
	if err != nil {
		return nil, fmt.Errorf("failed to convert building kind to protobuf: %w", err)
	}

	nextUpgradeLevel, err := village.NextBuildingUpgradeLevel(ctx, buildingKind)
	if err != nil {
		return nil, fmt.Errorf("failed to get building (kind: %s) next upgrade level: %w", buildingKind, err)
	}
	if nextUpgradeLevel > model.BuildingMaxLevel {
		return nil, status.Error(codes.FailedPrecondition, "building is already at max level")
	}

	cost := buildingKind.CalculateUpgradeCost(nextUpgradeLevel, village.BuildingLevel.Get(model.Building_Kind_HALL))
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}

	village.SpendResources(cost)
	err = model.UpdateVillage(ctx, village.Id, village)
	if err != nil {
		return nil, fmt.Errorf("failed to update village: %w", err)
	}

	order, err := model.CreateBuildingUpgradeOrder(ctx, &model.BuildingUpgradeOrder{
		Level:        nextUpgradeLevel,
		TimeLeft:     cost.Time,
		BuildingKind: buildingKind,
		VillageId:    village.Id,
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

func (s *Server) CancelBuildingUpgradeOrder(ctx context.Context, req *connect.Request[serverv1.CancelBuildingUpgradeOrderRequest]) (*connect.Response[serverv1.CancelBuildingUpgradeOrderResponse], error) {
	order, found, err := model.GetBuildingUpgradeOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get building upgrade order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "building upgrade order not found")
	}

	village, found, err := model.GetVillage(ctx, order.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	orders, err := model.GetBuildingUpgradeOrders(ctx, sq.Eq{"building_kind": order.BuildingKind}, db.OrderQueryOption{Column: "level", Desc: true})
	if err != nil {
		return nil, fmt.Errorf("failed to get building (kind: %s) upgrade orders: %w", order.BuildingKind, err)
	}
	if order.Id != orders[0].Id {
		return nil, status.Error(codes.FailedPrecondition, "building upgrade order is not the latest order")
	}

	cost := order.BuildingKind.CalculateUpgradeCost(order.Level, village.BuildingLevel.Get(model.Building_Kind_HALL))
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

/* TROOPS */
func (s *Server) GetTroops(ctx context.Context, req *connect.Request[serverv1.GetTroopsRequest]) (*connect.Response[serverv1.GetTroopsResponse], error) {
	return connect.NewResponse(&serverv1.GetTroopsResponse{
		Troops: lo.Map(model.TroopKinds, func(t model.Troop_Kind, _ int) *serverv1.Troop { return t.ToTroopProtobuf() }),
	}), nil
}

func (s *Server) IssueTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.IssueTroopTrainingOrderRequest]) (*connect.Response[serverv1.IssueTroopTrainingOrderResponse], error) {
	village, found, err := model.GetVillage(ctx, req.Msg.VillageId)
	if err != nil {
		return nil, fmt.Errorf("failed to get village: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "village not found")
	}

	troopKind, err := model.Troop_KindFromProtobuf(req.Msg.TroopKind)
	if err != nil {
		return nil, status.Error(codes.InvalidArgument, "invalid troop kind")
	}

	cost := troopKind.CalculateTrainingCost(req.Msg.Quantity, 0)
	if !village.CanAfford(cost) {
		return nil, status.Error(codes.FailedPrecondition, "not enough resources")
	}
	if troopKind == model.Troop_Kind_LEADER {
		trainableLeaders, err := model.GetPlayerTrainableLeaders(ctx, village.PlayerId)
		if err != nil {
			return nil, fmt.Errorf("failed to get player trainable leaders: %w", err)
		}
		if trainableLeaders <= 0 {
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
		TroopKind: troopKind,
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

func (s *Server) CancelTroopTrainingOrder(ctx context.Context, req *connect.Request[serverv1.CancelTroopTrainingOrderRequest]) (*connect.Response[serverv1.CancelTroopTrainingOrderResponse], error) {
	order, found, err := model.GetTroopTrainingOrder(ctx, req.Msg.Id)
	if err != nil {
		return nil, fmt.Errorf("failed to get troop training order: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "troop training order not found")
	}

	village, err := order.Village(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get village (id: %d): %w", order.VillageId, err)
	}

	cost := order.TroopKind.CalculateTrainingCost(order.Quantity, 0)
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

	pWorld, err := world.ToProtobuf(ctx, req.Msg.LoadFields)
	if err != nil {
		return nil, fmt.Errorf("failed to convert world to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetWorldResponse{World: pWorld}), nil
}

func (s *Server) Attack(ctx context.Context, req *connect.Request[serverv1.AttackRequest]) (*connect.Response[serverv1.AttackResponse], error) {
	_, found, err := model.GetWorldField(ctx, sq.Eq{"x": req.Msg.Attack.TargetCoords.X, "y": req.Msg.Attack.TargetCoords.Y})
	if err != nil {
		return nil, fmt.Errorf("failed to get world field: %w", err)
	}
	if found {
		return nil, status.Error(codes.AlreadyExists, "field already exists")
	}

	// TODO: Get player from auth
	_, err = model.CreateVillage(context.Background(), req.Msg.Attack.TargetCoords.X, req.Msg.Attack.TargetCoords.Y, 1)
	if err != nil {
		return nil, fmt.Errorf("failed to create village: %w", err)
	}

	return connect.NewResponse(&serverv1.AttackResponse{}), nil
}

/* PLAYERS */
func (s *Server) GetPlayer(ctx context.Context, req *connect.Request[serverv1.GetPlayerRequest]) (*connect.Response[serverv1.GetPlayerResponse], error) {
	id := req.Msg.Id.GetValue()
	if req.Msg.Id == nil {
		id = 1 // TODO: Get player from auth
	}

	player, found, err := model.GetPlayer(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get player: %w", err)
	}
	if !found {
		return nil, status.Error(codes.NotFound, "player not found")
	}

	pPlayer, err := player.ToProtobuf(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to convert player to protobuf: %w", err)
	}

	return connect.NewResponse(&serverv1.GetPlayerResponse{Player: pPlayer}), nil
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
			log.Fatalf("failed to create database: %v", err)
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

		villages, err := model.GetVillages(ctx)
		if err != nil {
			log.Printf("failed to get villages: %v", err)
			continue
		}
		for _, village := range villages {
			// TODO: Use transaction
			buildingUpgradeOrders, err := model.GetBuildingUpgradeOrders(ctx, sq.Eq{"village_id": village.Id})
			if err != nil {
				log.Printf("failed to get building upgrade orders (village_id: %d): %v", village.Id, err)
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
					village.BuildingLevel.Increment(order.BuildingKind)
				} else {
					err := model.UpdateBuildingUpgradeOrder(ctx, order.Id, order)
					if err != nil {
						log.Printf("failed to update building training order (id: %d): %v", order.Id, err)
						continue
					}
				}
			}

			troopTrainingOrders, err := model.GetTroopTrainingOrders(ctx, sq.Eq{"village_id": village.Id})
			if err != nil {
				log.Printf("failed to get troop training orders (village_id: %d): %v", village.Id, err)
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
					village.TroopQuantity.Increment(order.TroopKind, order.Quantity)
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
	err := server.Run(":3000")
	if err != nil {
		log.Fatalf("failed run server: %v", err)
	}
}

func CreateDB() error {
	_, err := db.DB.Exec(`
		CREATE TABLE players (
			id INTEGER PRIMARY KEY
		);

		CREATE TABLE villages (
			id INTEGER PRIMARY KEY,
			gold INTERGER NOT NULL,
			building_level TEXT NOT NULL,
			troop_quantity TEXT NOT NULL,

			player_id INTEGER NOT NULL,
			FOREIGN KEY(player_id) REFERENCES villages(id)
		);

		CREATE TABLE building_upgrade_orders (
			id INTEGER PRIMARY KEY,
			level INTEGER NOT NULL,
			time_left INTEGER NOT NULL,
			building_kind VARCHAR(255) NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE troop_training_orders (
			id INTEGER PRIMARY KEY,
			quantity INTEGER NOT NULL,
			time_left INTEGER NOT NULL,
			troop_kind VARCHAR(255) NOT NULL,

			village_id INTEGER NOT NULL,
			FOREIGN KEY(village_id) REFERENCES villages(id)
		);

		CREATE TABLE world_fields (
			x INTEGER NOT NULL,
			y INTEGER NOT NULL,
			entity_kind INTERGER NOT NULL,
			entity_id INTEGER NOT NULL
		);
		CREATE UNIQUE INDEX unq_x_y ON world_fields(x, y);

		CREATE TABLE temples (
			id INTEGER PRIMARY KEY
		);
	`)
	if err != nil {
		return fmt.Errorf("failed to create tables: %w", err)
	}

	return nil
}

func SeedDB() error {
	_, err := model.CreatePlayer(context.Background(), 3, 4)
	if err != nil {
		return fmt.Errorf("failed to create player: %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 1, 1)
	if err != nil {
		return fmt.Errorf("failed to create temple (1,1): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 8, 1)
	if err != nil {
		return fmt.Errorf("failed to create temple (8,1): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 8, 8)
	if err != nil {
		return fmt.Errorf("failed to create temple (8,8): %w", err)
	}
	_, err = model.CreateTemple(context.Background(), 1, 8)
	if err != nil {
		return fmt.Errorf("failed to create temple (1,8): %w", err)
	}

	return nil
}

func DropDB() error {
	_, err := db.DB.Exec(`
		DROP TABLE troop_training_orders;
		DROP TABLE building_upgrade_orders;
		DROP TABLE villages;
		DROP TABLE temples;
		DROP TABLE world_fields;
		DROP TABLE players;
	`)
	return err
}
