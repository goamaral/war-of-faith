package main

import (
	"fmt"
	"log"
	"time"

	"github.com/bufbuild/connect-go"
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
	serverv1.UnimplementedServiceServer
}

func main() {
	i := di.NewInjector()

	go runServer(i)

	ticker := time.NewTicker(time.Second)
	for range ticker.C {
		state.WorldInstance.SafeCall(func(w *state.World) { w.Tick() })
	}
}

func runServer(i *do.Injector) {
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
		&Server{},
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
func (s *Server) SubscribeToWorld(google.protobuf.Empty) returns (stream World) {

}
func (s *Server) IssueAttack(IssueAttackRequest) returns (IssueAttackResponse) {

}
func (s *Server) CancelAttack(CancelAttackRequest) returns (CancelAttackResponse) {

}

  /* VILLAGES */
func (s *Server) IssueBuildingUpgradeOrder(IssueBuildingUpgradeOrderRequest) returns (IssueBuildingUpgradeOrderResponse) {

}
func (s *Server) CancelBuildingUpgradeOrder(CancelBuildingUpgradeOrderRequest) returns (CancelBuildingUpgradeOrderResponse) {

}
func (s *Server) IssueTroopTrainingOrder(IssueTroopTrainingOrderRequest) returns (IssueTroopTrainingOrderResponse) {

}
func (s *Server) CancelTroopTrainingOrder(CancelTroopTrainingOrderRequest) returns (CancelTroopTrainingOrderResponse) {

}
func (s *Server) IssueResourceTransferOrder(IssueResourceTransferOrderRequest) returns (IssueResourceTransferOrderResponse) {

}
func (s *Server) CancelResourceTransferOrder(CancelResourceTransferOrderRequest) returns (CancelResourceTransferOrderResponse) {

}