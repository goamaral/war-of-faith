package helper

import (
	"context"
	"errors"

	"github.com/bufbuild/connect-go"
	"github.com/bufbuild/protovalidate-go"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/reflect/protoreflect"
)

func ValidationInterceptor(validator *protovalidate.Validator) connect.UnaryInterceptorFunc {
	return connect.UnaryInterceptorFunc(func(next connect.UnaryFunc) connect.UnaryFunc {
		return connect.UnaryFunc(func(ctx context.Context, req connect.AnyRequest) (connect.AnyResponse, error) {
			err := validator.Validate(req.Any().(protoreflect.ProtoMessage))
			if err != nil {
				if vErr, ok := err.(*protovalidate.ValidationError); ok {
					connectErr := connect.NewError(connect.Code(connect.CodeInvalidArgument), errors.New("validation error"))
					detail, err := connect.NewErrorDetail(vErr.ToProto())
					if err != nil {
						return nil, err
					}
					connectErr.AddDetail(detail)
					return nil, connectErr
				}
				return nil, err
			}
			return next(ctx, req)
		})
	})
}

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
