package main

import (
	"context"
	"log"
	"net/http"
	pb "war-of-faith/pkg/protobuf/server"
	pbconnect "war-of-faith/pkg/protobuf/server/serverconnect"

	connectgo "github.com/bufbuild/connect-go"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

type Server struct {
	pb.UnimplementedServiceServer
}

func (s *Server) GetEntity(context.Context, *connectgo.Request[pb.GetEntityRequest]) (*connectgo.Response[pb.GetEntityResponse], error) {
	return connectgo.NewResponse(&pb.GetEntityResponse{}), nil
}

func main() {
	mux := http.NewServeMux()
	// The generated constructors return a path and a plain net/http
	// handler.
	mux.Handle(pbconnect.NewServiceHandler(&Server{}))
	err := http.ListenAndServe(
		"localhost:3000",
		// For gRPC clients, it's convenient to support HTTP/2 without TLS. You can
		// avoid x/net/http2 by using http.ListenAndServeTLS.
		h2c.NewHandler(mux, &http2.Server{}),
	)
	log.Fatalf("listen failed: %v", err)
}
