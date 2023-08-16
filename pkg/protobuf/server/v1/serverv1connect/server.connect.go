// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: server/v1/server.proto

package serverv1connect

import (
	context "context"
	errors "errors"
	connect_go "github.com/bufbuild/connect-go"
	http "net/http"
	strings "strings"
	v1 "war-of-faith/pkg/protobuf/server/v1"
)

// This is a compile-time assertion to ensure that this generated file and the connect package are
// compatible. If you get a compiler error that this constant is not defined, this code was
// generated with a version of connect newer than the one compiled into your binary. You can fix the
// problem by either regenerating this code with an older version of connect or updating the connect
// version compiled into your binary.
const _ = connect_go.IsAtLeastVersion0_1_0

const (
	// ServiceName is the fully-qualified name of the Service service.
	ServiceName = "server.v1.Service"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// ServiceGetVillageProcedure is the fully-qualified name of the Service's GetVillage RPC.
	ServiceGetVillageProcedure = "/server.v1.Service/GetVillage"
	// ServiceUpgradeBuildingProcedure is the fully-qualified name of the Service's UpgradeBuilding RPC.
	ServiceUpgradeBuildingProcedure = "/server.v1.Service/UpgradeBuilding"
	// ServiceCancelUpgradeBuildingProcedure is the fully-qualified name of the Service's
	// CancelUpgradeBuilding RPC.
	ServiceCancelUpgradeBuildingProcedure = "/server.v1.Service/CancelUpgradeBuilding"
	// ServiceIssueTroopTrainingOrderProcedure is the fully-qualified name of the Service's
	// IssueTroopTrainingOrder RPC.
	ServiceIssueTroopTrainingOrderProcedure = "/server.v1.Service/IssueTroopTrainingOrder"
)

// ServiceClient is a client for the server.v1.Service service.
type ServiceClient interface {
	GetVillage(context.Context, *connect_go.Request[v1.GetVillageRequest]) (*connect_go.Response[v1.GetVillageResponse], error)
	UpgradeBuilding(context.Context, *connect_go.Request[v1.UpgradeBuildingRequest]) (*connect_go.Response[v1.UpgradeBuildingResponse], error)
	CancelUpgradeBuilding(context.Context, *connect_go.Request[v1.CancelUpgradeBuildingRequest]) (*connect_go.Response[v1.CancelUpgradeBuildingResponse], error)
	IssueTroopTrainingOrder(context.Context, *connect_go.Request[v1.IssueTroopTrainingOrderRequest]) (*connect_go.Response[v1.IssueTroopTrainingOrderResponse], error)
}

// NewServiceClient constructs a client for the server.v1.Service service. By default, it uses the
// Connect protocol with the binary Protobuf Codec, asks for gzipped responses, and sends
// uncompressed requests. To use the gRPC or gRPC-Web protocols, supply the connect.WithGRPC() or
// connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewServiceClient(httpClient connect_go.HTTPClient, baseURL string, opts ...connect_go.ClientOption) ServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	return &serviceClient{
		getVillage: connect_go.NewClient[v1.GetVillageRequest, v1.GetVillageResponse](
			httpClient,
			baseURL+ServiceGetVillageProcedure,
			opts...,
		),
		upgradeBuilding: connect_go.NewClient[v1.UpgradeBuildingRequest, v1.UpgradeBuildingResponse](
			httpClient,
			baseURL+ServiceUpgradeBuildingProcedure,
			opts...,
		),
		cancelUpgradeBuilding: connect_go.NewClient[v1.CancelUpgradeBuildingRequest, v1.CancelUpgradeBuildingResponse](
			httpClient,
			baseURL+ServiceCancelUpgradeBuildingProcedure,
			opts...,
		),
		issueTroopTrainingOrder: connect_go.NewClient[v1.IssueTroopTrainingOrderRequest, v1.IssueTroopTrainingOrderResponse](
			httpClient,
			baseURL+ServiceIssueTroopTrainingOrderProcedure,
			opts...,
		),
	}
}

// serviceClient implements ServiceClient.
type serviceClient struct {
	getVillage              *connect_go.Client[v1.GetVillageRequest, v1.GetVillageResponse]
	upgradeBuilding         *connect_go.Client[v1.UpgradeBuildingRequest, v1.UpgradeBuildingResponse]
	cancelUpgradeBuilding   *connect_go.Client[v1.CancelUpgradeBuildingRequest, v1.CancelUpgradeBuildingResponse]
	issueTroopTrainingOrder *connect_go.Client[v1.IssueTroopTrainingOrderRequest, v1.IssueTroopTrainingOrderResponse]
}

// GetVillage calls server.v1.Service.GetVillage.
func (c *serviceClient) GetVillage(ctx context.Context, req *connect_go.Request[v1.GetVillageRequest]) (*connect_go.Response[v1.GetVillageResponse], error) {
	return c.getVillage.CallUnary(ctx, req)
}

// UpgradeBuilding calls server.v1.Service.UpgradeBuilding.
func (c *serviceClient) UpgradeBuilding(ctx context.Context, req *connect_go.Request[v1.UpgradeBuildingRequest]) (*connect_go.Response[v1.UpgradeBuildingResponse], error) {
	return c.upgradeBuilding.CallUnary(ctx, req)
}

// CancelUpgradeBuilding calls server.v1.Service.CancelUpgradeBuilding.
func (c *serviceClient) CancelUpgradeBuilding(ctx context.Context, req *connect_go.Request[v1.CancelUpgradeBuildingRequest]) (*connect_go.Response[v1.CancelUpgradeBuildingResponse], error) {
	return c.cancelUpgradeBuilding.CallUnary(ctx, req)
}

// IssueTroopTrainingOrder calls server.v1.Service.IssueTroopTrainingOrder.
func (c *serviceClient) IssueTroopTrainingOrder(ctx context.Context, req *connect_go.Request[v1.IssueTroopTrainingOrderRequest]) (*connect_go.Response[v1.IssueTroopTrainingOrderResponse], error) {
	return c.issueTroopTrainingOrder.CallUnary(ctx, req)
}

// ServiceHandler is an implementation of the server.v1.Service service.
type ServiceHandler interface {
	GetVillage(context.Context, *connect_go.Request[v1.GetVillageRequest]) (*connect_go.Response[v1.GetVillageResponse], error)
	UpgradeBuilding(context.Context, *connect_go.Request[v1.UpgradeBuildingRequest]) (*connect_go.Response[v1.UpgradeBuildingResponse], error)
	CancelUpgradeBuilding(context.Context, *connect_go.Request[v1.CancelUpgradeBuildingRequest]) (*connect_go.Response[v1.CancelUpgradeBuildingResponse], error)
	IssueTroopTrainingOrder(context.Context, *connect_go.Request[v1.IssueTroopTrainingOrderRequest]) (*connect_go.Response[v1.IssueTroopTrainingOrderResponse], error)
}

// NewServiceHandler builds an HTTP handler from the service implementation. It returns the path on
// which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewServiceHandler(svc ServiceHandler, opts ...connect_go.HandlerOption) (string, http.Handler) {
	serviceGetVillageHandler := connect_go.NewUnaryHandler(
		ServiceGetVillageProcedure,
		svc.GetVillage,
		opts...,
	)
	serviceUpgradeBuildingHandler := connect_go.NewUnaryHandler(
		ServiceUpgradeBuildingProcedure,
		svc.UpgradeBuilding,
		opts...,
	)
	serviceCancelUpgradeBuildingHandler := connect_go.NewUnaryHandler(
		ServiceCancelUpgradeBuildingProcedure,
		svc.CancelUpgradeBuilding,
		opts...,
	)
	serviceIssueTroopTrainingOrderHandler := connect_go.NewUnaryHandler(
		ServiceIssueTroopTrainingOrderProcedure,
		svc.IssueTroopTrainingOrder,
		opts...,
	)
	return "/server.v1.Service/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case ServiceGetVillageProcedure:
			serviceGetVillageHandler.ServeHTTP(w, r)
		case ServiceUpgradeBuildingProcedure:
			serviceUpgradeBuildingHandler.ServeHTTP(w, r)
		case ServiceCancelUpgradeBuildingProcedure:
			serviceCancelUpgradeBuildingHandler.ServeHTTP(w, r)
		case ServiceIssueTroopTrainingOrderProcedure:
			serviceIssueTroopTrainingOrderHandler.ServeHTTP(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}

// UnimplementedServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedServiceHandler struct{}

func (UnimplementedServiceHandler) GetVillage(context.Context, *connect_go.Request[v1.GetVillageRequest]) (*connect_go.Response[v1.GetVillageResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("server.v1.Service.GetVillage is not implemented"))
}

func (UnimplementedServiceHandler) UpgradeBuilding(context.Context, *connect_go.Request[v1.UpgradeBuildingRequest]) (*connect_go.Response[v1.UpgradeBuildingResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("server.v1.Service.UpgradeBuilding is not implemented"))
}

func (UnimplementedServiceHandler) CancelUpgradeBuilding(context.Context, *connect_go.Request[v1.CancelUpgradeBuildingRequest]) (*connect_go.Response[v1.CancelUpgradeBuildingResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("server.v1.Service.CancelUpgradeBuilding is not implemented"))
}

func (UnimplementedServiceHandler) IssueTroopTrainingOrder(context.Context, *connect_go.Request[v1.IssueTroopTrainingOrderRequest]) (*connect_go.Response[v1.IssueTroopTrainingOrderResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("server.v1.Service.IssueTroopTrainingOrder is not implemented"))
}
