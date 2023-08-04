// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: server/server.proto

package serverconnect

import (
	context "context"
	errors "errors"
	connect_go "github.com/bufbuild/connect-go"
	http "net/http"
	strings "strings"
	server "war-of-faith/pkg/protobuf/server"
)

// This is a compile-time assertion to ensure that this generated file and the connect package are
// compatible. If you get a compiler error that this constant is not defined, this code was
// generated with a version of connect newer than the one compiled into your binary. You can fix the
// problem by either regenerating this code with an older version of connect or updating the connect
// version compiled into your binary.
const _ = connect_go.IsAtLeastVersion0_1_0

const (
	// ServiceName is the fully-qualified name of the Service service.
	ServiceName = "Service"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// ServiceGetEntityProcedure is the fully-qualified name of the Service's GetEntity RPC.
	ServiceGetEntityProcedure = "/Service/GetEntity"
)

// ServiceClient is a client for the Service service.
type ServiceClient interface {
	GetEntity(context.Context, *connect_go.Request[server.GetEntityRequest]) (*connect_go.Response[server.GetEntityResponse], error)
}

// NewServiceClient constructs a client for the Service service. By default, it uses the Connect
// protocol with the binary Protobuf Codec, asks for gzipped responses, and sends uncompressed
// requests. To use the gRPC or gRPC-Web protocols, supply the connect.WithGRPC() or
// connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewServiceClient(httpClient connect_go.HTTPClient, baseURL string, opts ...connect_go.ClientOption) ServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	return &serviceClient{
		getEntity: connect_go.NewClient[server.GetEntityRequest, server.GetEntityResponse](
			httpClient,
			baseURL+ServiceGetEntityProcedure,
			opts...,
		),
	}
}

// serviceClient implements ServiceClient.
type serviceClient struct {
	getEntity *connect_go.Client[server.GetEntityRequest, server.GetEntityResponse]
}

// GetEntity calls Service.GetEntity.
func (c *serviceClient) GetEntity(ctx context.Context, req *connect_go.Request[server.GetEntityRequest]) (*connect_go.Response[server.GetEntityResponse], error) {
	return c.getEntity.CallUnary(ctx, req)
}

// ServiceHandler is an implementation of the Service service.
type ServiceHandler interface {
	GetEntity(context.Context, *connect_go.Request[server.GetEntityRequest]) (*connect_go.Response[server.GetEntityResponse], error)
}

// NewServiceHandler builds an HTTP handler from the service implementation. It returns the path on
// which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewServiceHandler(svc ServiceHandler, opts ...connect_go.HandlerOption) (string, http.Handler) {
	serviceGetEntityHandler := connect_go.NewUnaryHandler(
		ServiceGetEntityProcedure,
		svc.GetEntity,
		opts...,
	)
	return "/.Service/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case ServiceGetEntityProcedure:
			serviceGetEntityHandler.ServeHTTP(w, r)
		default:
			http.NotFound(w, r)
		}
	})
}

// UnimplementedServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedServiceHandler struct{}

func (UnimplementedServiceHandler) GetEntity(context.Context, *connect_go.Request[server.GetEntityRequest]) (*connect_go.Response[server.GetEntityResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("Service.GetEntity is not implemented"))
}
