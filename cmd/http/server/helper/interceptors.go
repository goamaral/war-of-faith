package helper

import (
	"context"

	"github.com/bufbuild/connect-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func GRPCStatusToConnectStatusInterceptor() connect.UnaryInterceptorFunc {
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
