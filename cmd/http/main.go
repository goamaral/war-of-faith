package main

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"connectrpc.com/connect"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/samber/do"

	"war-of-faith/cmd/http/di"
	"war-of-faith/cmd/http/server"
	"war-of-faith/cmd/http/server/helper"
	"war-of-faith/cmd/http/state"
	serverv1 "war-of-faith/pkg/protobuf/server/v1"
	"war-of-faith/pkg/protobuf/server/v1/serverv1connect"
)

type Server struct {
	// serverv1.UnimplementedServiceServer
	serverv1connect.UnimplementedServiceHandler
	worldSubscriptionMap *WorldSubscriptionMap
	world                *state.World
}

func NewServer() *Server {
	wm := NewWorldSubscriptionMap()
	return &Server{
		worldSubscriptionMap: wm,
		world:                state.NewWorld(wm.C),
	}
}

func main() {
	i := di.NewInjector()
	srv := NewServer()

	go runServer(i, srv)

	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		srv.world.Lock()
		srv.world.Tick()
		srv.world.Unlock()
	}
}

func runServer(i *do.Injector, srv *Server) {
	ginEngine := gin.Default()
	ginEngine.SetTrustedProxies(nil)
	ginEngine.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:4000"},
		AllowMethods:     []string{"POST"},
		AllowHeaders:     []string{"Origin", "Connect-Protocol-Version", "Content-Type"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	server.NewPublicV1Server(ginEngine, i)
	cors.Default()

	path, handler := serverv1connect.NewServiceHandler(
		srv,
		connect.WithInterceptors(
			helper.GRPCStatusToConnectStatusInterceptor(),
		),
	)
	ginEngine.Any(fmt.Sprintf("%s*w", path), gin.WrapH(handler)) // TODO: Add auth

	if err := ginEngine.Run(":3000"); err != nil {
		log.Fatalf("failed run server: %v", err)
	}
}

/* WORLD */
// GetWorld
func (s *Server) GetWorld(ctx context.Context, req *connect.Request[serverv1.GetWorldRequest]) (*connect.Response[serverv1.GetWorldResponse], error) {
	s.world.RLock()
	defer s.world.RUnlock()
	return connect.NewResponse(&serverv1.GetWorldResponse{World: s.world.World}), nil
}

// SubscribeToWorld
func (s *Server) SubscribeToWorld(ctx context.Context, req *connect.Request[serverv1.SubscribeToWorldRequest], stream *connect.ServerStream[serverv1.SubscribeToWorldResponse]) error {
	s.worldSubscriptionMap.subscribe(stream)
	defer s.worldSubscriptionMap.unsubscribe(stream)
	<-ctx.Done()
	return nil
}

type WorldSubscriptionMap struct {
	sync.Mutex
	m map[string]*connect.ServerStream[serverv1.SubscribeToWorldResponse]
	C chan *serverv1.SubscribeToWorldResponse_Patch
}

func NewWorldSubscriptionMap() *WorldSubscriptionMap {
	wm := &WorldSubscriptionMap{
		m: map[string]*connect.ServerStream[serverv1.SubscribeToWorldResponse]{},
		C: make(chan *serverv1.SubscribeToWorldResponse_Patch),
	}

	go func() {
		for p := range wm.C {
			wm.Lock()
			for _, stream := range wm.m {
				err := stream.Send(&serverv1.SubscribeToWorldResponse{Patch: p})
				if err != nil {
					panic(err)
				}
			}
			wm.Unlock()
		}
	}()

	return wm
}

func (wm *WorldSubscriptionMap) subscribe(stream *connect.ServerStream[serverv1.SubscribeToWorldResponse]) {
	wm.Lock()
	defer wm.Unlock()
	wm.m[stream.Conn().Peer().Addr] = stream
}

func (wm *WorldSubscriptionMap) unsubscribe(stream *connect.ServerStream[serverv1.SubscribeToWorldResponse]) {
	wm.Lock()
	defer wm.Unlock()
	delete(wm.m, stream.Conn().Peer().Addr)
}

// func (s *Server) IssueAttack(IssueAttackRequest) returns (IssueAttackResponse) {

// }
// func (s *Server) CancelAttack(CancelAttackRequest) returns (CancelAttackResponse) {

// }

/* VILLAGES */
// func (s *Server) IssueBuildingUpgradeOrder(IssueBuildingUpgradeOrderRequest) returns (IssueBuildingUpgradeOrderResponse) {

// }
// func (s *Server) CancelBuildingUpgradeOrder(CancelBuildingUpgradeOrderRequest) returns (CancelBuildingUpgradeOrderResponse) {

// }
// func (s *Server) IssueTroopTrainingOrder(IssueTroopTrainingOrderRequest) returns (IssueTroopTrainingOrderResponse) {

// }
// func (s *Server) CancelTroopTrainingOrder(CancelTroopTrainingOrderRequest) returns (CancelTroopTrainingOrderResponse) {

// }
// func (s *Server) IssueResourceTransferOrder(IssueResourceTransferOrderRequest) returns (IssueResourceTransferOrderResponse) {

// }
// func (s *Server) CancelResourceTransferOrder(CancelResourceTransferOrderRequest) returns (CancelResourceTransferOrderResponse) {

// }
