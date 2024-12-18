// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.2.0
// - protoc             (unknown)
// source: server/v1/server.proto

package serverv1

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.32.0 or later.
const _ = grpc.SupportPackageIsVersion7

// ServiceClient is the client API for Service service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type ServiceClient interface {
	// WORLD
	GetWorld(ctx context.Context, in *GetWorldRequest, opts ...grpc.CallOption) (*GetWorldResponse, error)
	SubscribeToWorld(ctx context.Context, in *SubscribeToWorldRequest, opts ...grpc.CallOption) (Service_SubscribeToWorldClient, error)
	IssueAttack(ctx context.Context, in *IssueAttackRequest, opts ...grpc.CallOption) (*IssueAttackResponse, error)
	CancelAttack(ctx context.Context, in *CancelAttackRequest, opts ...grpc.CallOption) (*CancelAttackResponse, error)
	// VILLAGES
	IssueBuildingUpgradeOrder(ctx context.Context, in *IssueBuildingUpgradeOrderRequest, opts ...grpc.CallOption) (*IssueBuildingUpgradeOrderResponse, error)
	CancelBuildingUpgradeOrder(ctx context.Context, in *CancelBuildingUpgradeOrderRequest, opts ...grpc.CallOption) (*CancelBuildingUpgradeOrderResponse, error)
	IssueTroopTrainingOrder(ctx context.Context, in *IssueTroopTrainingOrderRequest, opts ...grpc.CallOption) (*IssueTroopTrainingOrderResponse, error)
	CancelTroopTrainingOrder(ctx context.Context, in *CancelTroopTrainingOrderRequest, opts ...grpc.CallOption) (*CancelTroopTrainingOrderResponse, error)
	IssueResourceTransferOrder(ctx context.Context, in *IssueResourceTransferOrderRequest, opts ...grpc.CallOption) (*IssueResourceTransferOrderResponse, error)
	CancelResourceTransferOrder(ctx context.Context, in *CancelResourceTransferOrderRequest, opts ...grpc.CallOption) (*CancelResourceTransferOrderResponse, error)
}

type serviceClient struct {
	cc grpc.ClientConnInterface
}

func NewServiceClient(cc grpc.ClientConnInterface) ServiceClient {
	return &serviceClient{cc}
}

func (c *serviceClient) GetWorld(ctx context.Context, in *GetWorldRequest, opts ...grpc.CallOption) (*GetWorldResponse, error) {
	out := new(GetWorldResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/GetWorld", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) SubscribeToWorld(ctx context.Context, in *SubscribeToWorldRequest, opts ...grpc.CallOption) (Service_SubscribeToWorldClient, error) {
	stream, err := c.cc.NewStream(ctx, &Service_ServiceDesc.Streams[0], "/server.v1.Service/SubscribeToWorld", opts...)
	if err != nil {
		return nil, err
	}
	x := &serviceSubscribeToWorldClient{stream}
	if err := x.ClientStream.SendMsg(in); err != nil {
		return nil, err
	}
	if err := x.ClientStream.CloseSend(); err != nil {
		return nil, err
	}
	return x, nil
}

type Service_SubscribeToWorldClient interface {
	Recv() (*SubscribeToWorldResponse, error)
	grpc.ClientStream
}

type serviceSubscribeToWorldClient struct {
	grpc.ClientStream
}

func (x *serviceSubscribeToWorldClient) Recv() (*SubscribeToWorldResponse, error) {
	m := new(SubscribeToWorldResponse)
	if err := x.ClientStream.RecvMsg(m); err != nil {
		return nil, err
	}
	return m, nil
}

func (c *serviceClient) IssueAttack(ctx context.Context, in *IssueAttackRequest, opts ...grpc.CallOption) (*IssueAttackResponse, error) {
	out := new(IssueAttackResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/IssueAttack", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) CancelAttack(ctx context.Context, in *CancelAttackRequest, opts ...grpc.CallOption) (*CancelAttackResponse, error) {
	out := new(CancelAttackResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/CancelAttack", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) IssueBuildingUpgradeOrder(ctx context.Context, in *IssueBuildingUpgradeOrderRequest, opts ...grpc.CallOption) (*IssueBuildingUpgradeOrderResponse, error) {
	out := new(IssueBuildingUpgradeOrderResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/IssueBuildingUpgradeOrder", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) CancelBuildingUpgradeOrder(ctx context.Context, in *CancelBuildingUpgradeOrderRequest, opts ...grpc.CallOption) (*CancelBuildingUpgradeOrderResponse, error) {
	out := new(CancelBuildingUpgradeOrderResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/CancelBuildingUpgradeOrder", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) IssueTroopTrainingOrder(ctx context.Context, in *IssueTroopTrainingOrderRequest, opts ...grpc.CallOption) (*IssueTroopTrainingOrderResponse, error) {
	out := new(IssueTroopTrainingOrderResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/IssueTroopTrainingOrder", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) CancelTroopTrainingOrder(ctx context.Context, in *CancelTroopTrainingOrderRequest, opts ...grpc.CallOption) (*CancelTroopTrainingOrderResponse, error) {
	out := new(CancelTroopTrainingOrderResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/CancelTroopTrainingOrder", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) IssueResourceTransferOrder(ctx context.Context, in *IssueResourceTransferOrderRequest, opts ...grpc.CallOption) (*IssueResourceTransferOrderResponse, error) {
	out := new(IssueResourceTransferOrderResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/IssueResourceTransferOrder", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *serviceClient) CancelResourceTransferOrder(ctx context.Context, in *CancelResourceTransferOrderRequest, opts ...grpc.CallOption) (*CancelResourceTransferOrderResponse, error) {
	out := new(CancelResourceTransferOrderResponse)
	err := c.cc.Invoke(ctx, "/server.v1.Service/CancelResourceTransferOrder", in, out, opts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// ServiceServer is the server API for Service service.
// All implementations should embed UnimplementedServiceServer
// for forward compatibility
type ServiceServer interface {
	// WORLD
	GetWorld(context.Context, *GetWorldRequest) (*GetWorldResponse, error)
	SubscribeToWorld(*SubscribeToWorldRequest, Service_SubscribeToWorldServer) error
	IssueAttack(context.Context, *IssueAttackRequest) (*IssueAttackResponse, error)
	CancelAttack(context.Context, *CancelAttackRequest) (*CancelAttackResponse, error)
	// VILLAGES
	IssueBuildingUpgradeOrder(context.Context, *IssueBuildingUpgradeOrderRequest) (*IssueBuildingUpgradeOrderResponse, error)
	CancelBuildingUpgradeOrder(context.Context, *CancelBuildingUpgradeOrderRequest) (*CancelBuildingUpgradeOrderResponse, error)
	IssueTroopTrainingOrder(context.Context, *IssueTroopTrainingOrderRequest) (*IssueTroopTrainingOrderResponse, error)
	CancelTroopTrainingOrder(context.Context, *CancelTroopTrainingOrderRequest) (*CancelTroopTrainingOrderResponse, error)
	IssueResourceTransferOrder(context.Context, *IssueResourceTransferOrderRequest) (*IssueResourceTransferOrderResponse, error)
	CancelResourceTransferOrder(context.Context, *CancelResourceTransferOrderRequest) (*CancelResourceTransferOrderResponse, error)
}

// UnimplementedServiceServer should be embedded to have forward compatible implementations.
type UnimplementedServiceServer struct {
}

func (UnimplementedServiceServer) GetWorld(context.Context, *GetWorldRequest) (*GetWorldResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetWorld not implemented")
}
func (UnimplementedServiceServer) SubscribeToWorld(*SubscribeToWorldRequest, Service_SubscribeToWorldServer) error {
	return status.Errorf(codes.Unimplemented, "method SubscribeToWorld not implemented")
}
func (UnimplementedServiceServer) IssueAttack(context.Context, *IssueAttackRequest) (*IssueAttackResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method IssueAttack not implemented")
}
func (UnimplementedServiceServer) CancelAttack(context.Context, *CancelAttackRequest) (*CancelAttackResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CancelAttack not implemented")
}
func (UnimplementedServiceServer) IssueBuildingUpgradeOrder(context.Context, *IssueBuildingUpgradeOrderRequest) (*IssueBuildingUpgradeOrderResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method IssueBuildingUpgradeOrder not implemented")
}
func (UnimplementedServiceServer) CancelBuildingUpgradeOrder(context.Context, *CancelBuildingUpgradeOrderRequest) (*CancelBuildingUpgradeOrderResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CancelBuildingUpgradeOrder not implemented")
}
func (UnimplementedServiceServer) IssueTroopTrainingOrder(context.Context, *IssueTroopTrainingOrderRequest) (*IssueTroopTrainingOrderResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method IssueTroopTrainingOrder not implemented")
}
func (UnimplementedServiceServer) CancelTroopTrainingOrder(context.Context, *CancelTroopTrainingOrderRequest) (*CancelTroopTrainingOrderResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CancelTroopTrainingOrder not implemented")
}
func (UnimplementedServiceServer) IssueResourceTransferOrder(context.Context, *IssueResourceTransferOrderRequest) (*IssueResourceTransferOrderResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method IssueResourceTransferOrder not implemented")
}
func (UnimplementedServiceServer) CancelResourceTransferOrder(context.Context, *CancelResourceTransferOrderRequest) (*CancelResourceTransferOrderResponse, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CancelResourceTransferOrder not implemented")
}

// UnsafeServiceServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to ServiceServer will
// result in compilation errors.
type UnsafeServiceServer interface {
	mustEmbedUnimplementedServiceServer()
}

func RegisterServiceServer(s grpc.ServiceRegistrar, srv ServiceServer) {
	s.RegisterService(&Service_ServiceDesc, srv)
}

func _Service_GetWorld_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(GetWorldRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).GetWorld(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/GetWorld",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).GetWorld(ctx, req.(*GetWorldRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_SubscribeToWorld_Handler(srv interface{}, stream grpc.ServerStream) error {
	m := new(SubscribeToWorldRequest)
	if err := stream.RecvMsg(m); err != nil {
		return err
	}
	return srv.(ServiceServer).SubscribeToWorld(m, &serviceSubscribeToWorldServer{stream})
}

type Service_SubscribeToWorldServer interface {
	Send(*SubscribeToWorldResponse) error
	grpc.ServerStream
}

type serviceSubscribeToWorldServer struct {
	grpc.ServerStream
}

func (x *serviceSubscribeToWorldServer) Send(m *SubscribeToWorldResponse) error {
	return x.ServerStream.SendMsg(m)
}

func _Service_IssueAttack_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(IssueAttackRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).IssueAttack(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/IssueAttack",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).IssueAttack(ctx, req.(*IssueAttackRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_CancelAttack_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CancelAttackRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).CancelAttack(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/CancelAttack",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).CancelAttack(ctx, req.(*CancelAttackRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_IssueBuildingUpgradeOrder_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(IssueBuildingUpgradeOrderRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).IssueBuildingUpgradeOrder(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/IssueBuildingUpgradeOrder",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).IssueBuildingUpgradeOrder(ctx, req.(*IssueBuildingUpgradeOrderRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_CancelBuildingUpgradeOrder_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CancelBuildingUpgradeOrderRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).CancelBuildingUpgradeOrder(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/CancelBuildingUpgradeOrder",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).CancelBuildingUpgradeOrder(ctx, req.(*CancelBuildingUpgradeOrderRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_IssueTroopTrainingOrder_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(IssueTroopTrainingOrderRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).IssueTroopTrainingOrder(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/IssueTroopTrainingOrder",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).IssueTroopTrainingOrder(ctx, req.(*IssueTroopTrainingOrderRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_CancelTroopTrainingOrder_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CancelTroopTrainingOrderRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).CancelTroopTrainingOrder(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/CancelTroopTrainingOrder",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).CancelTroopTrainingOrder(ctx, req.(*CancelTroopTrainingOrderRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_IssueResourceTransferOrder_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(IssueResourceTransferOrderRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).IssueResourceTransferOrder(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/IssueResourceTransferOrder",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).IssueResourceTransferOrder(ctx, req.(*IssueResourceTransferOrderRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Service_CancelResourceTransferOrder_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CancelResourceTransferOrderRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(ServiceServer).CancelResourceTransferOrder(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: "/server.v1.Service/CancelResourceTransferOrder",
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(ServiceServer).CancelResourceTransferOrder(ctx, req.(*CancelResourceTransferOrderRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// Service_ServiceDesc is the grpc.ServiceDesc for Service service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var Service_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "server.v1.Service",
	HandlerType: (*ServiceServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetWorld",
			Handler:    _Service_GetWorld_Handler,
		},
		{
			MethodName: "IssueAttack",
			Handler:    _Service_IssueAttack_Handler,
		},
		{
			MethodName: "CancelAttack",
			Handler:    _Service_CancelAttack_Handler,
		},
		{
			MethodName: "IssueBuildingUpgradeOrder",
			Handler:    _Service_IssueBuildingUpgradeOrder_Handler,
		},
		{
			MethodName: "CancelBuildingUpgradeOrder",
			Handler:    _Service_CancelBuildingUpgradeOrder_Handler,
		},
		{
			MethodName: "IssueTroopTrainingOrder",
			Handler:    _Service_IssueTroopTrainingOrder_Handler,
		},
		{
			MethodName: "CancelTroopTrainingOrder",
			Handler:    _Service_CancelTroopTrainingOrder_Handler,
		},
		{
			MethodName: "IssueResourceTransferOrder",
			Handler:    _Service_IssueResourceTransferOrder_Handler,
		},
		{
			MethodName: "CancelResourceTransferOrder",
			Handler:    _Service_CancelResourceTransferOrder_Handler,
		},
	},
	Streams: []grpc.StreamDesc{
		{
			StreamName:    "SubscribeToWorld",
			Handler:       _Service_SubscribeToWorld_Handler,
			ServerStreams: true,
		},
	},
	Metadata: "server/v1/server.proto",
}
