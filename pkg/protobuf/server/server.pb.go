// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        (unknown)
// source: server/server.proto

package server

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Entity struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id int32 `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *Entity) Reset() {
	*x = Entity{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_server_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Entity) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Entity) ProtoMessage() {}

func (x *Entity) ProtoReflect() protoreflect.Message {
	mi := &file_server_server_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Entity.ProtoReflect.Descriptor instead.
func (*Entity) Descriptor() ([]byte, []int) {
	return file_server_server_proto_rawDescGZIP(), []int{0}
}

func (x *Entity) GetId() int32 {
	if x != nil {
		return x.Id
	}
	return 0
}

// GetEntity
type GetEntityRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id int32 `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetEntityRequest) Reset() {
	*x = GetEntityRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_server_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetEntityRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetEntityRequest) ProtoMessage() {}

func (x *GetEntityRequest) ProtoReflect() protoreflect.Message {
	mi := &file_server_server_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetEntityRequest.ProtoReflect.Descriptor instead.
func (*GetEntityRequest) Descriptor() ([]byte, []int) {
	return file_server_server_proto_rawDescGZIP(), []int{1}
}

func (x *GetEntityRequest) GetId() int32 {
	if x != nil {
		return x.Id
	}
	return 0
}

type GetEntityResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Entity *Entity `protobuf:"bytes,1,opt,name=entity,proto3" json:"entity,omitempty"`
}

func (x *GetEntityResponse) Reset() {
	*x = GetEntityResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_server_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetEntityResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetEntityResponse) ProtoMessage() {}

func (x *GetEntityResponse) ProtoReflect() protoreflect.Message {
	mi := &file_server_server_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetEntityResponse.ProtoReflect.Descriptor instead.
func (*GetEntityResponse) Descriptor() ([]byte, []int) {
	return file_server_server_proto_rawDescGZIP(), []int{2}
}

func (x *GetEntityResponse) GetEntity() *Entity {
	if x != nil {
		return x.Entity
	}
	return nil
}

var File_server_server_proto protoreflect.FileDescriptor

var file_server_server_proto_rawDesc = []byte{
	0x0a, 0x13, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2f, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22, 0x18, 0x0a, 0x06, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x12,
	0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x05, 0x52, 0x02, 0x69, 0x64, 0x22,
	0x22, 0x0a, 0x10, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x05, 0x52,
	0x02, 0x69, 0x64, 0x22, 0x34, 0x0a, 0x11, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79,
	0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x1f, 0x0a, 0x06, 0x65, 0x6e, 0x74, 0x69,
	0x74, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x07, 0x2e, 0x45, 0x6e, 0x74, 0x69, 0x74,
	0x79, 0x52, 0x06, 0x65, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x32, 0x3d, 0x0a, 0x07, 0x53, 0x65, 0x72,
	0x76, 0x69, 0x63, 0x65, 0x12, 0x32, 0x0a, 0x09, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74,
	0x79, 0x12, 0x11, 0x2e, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79, 0x52, 0x65, 0x71,
	0x75, 0x65, 0x73, 0x74, 0x1a, 0x12, 0x2e, 0x47, 0x65, 0x74, 0x45, 0x6e, 0x74, 0x69, 0x74, 0x79,
	0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0x31, 0x42, 0x0b, 0x53, 0x65, 0x72, 0x76,
	0x65, 0x72, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x50, 0x01, 0x5a, 0x20, 0x77, 0x61, 0x72, 0x2d, 0x6f,
	0x66, 0x2d, 0x66, 0x61, 0x69, 0x74, 0x68, 0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x62, 0x75, 0x66, 0x2f, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x62, 0x06, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x33,
}

var (
	file_server_server_proto_rawDescOnce sync.Once
	file_server_server_proto_rawDescData = file_server_server_proto_rawDesc
)

func file_server_server_proto_rawDescGZIP() []byte {
	file_server_server_proto_rawDescOnce.Do(func() {
		file_server_server_proto_rawDescData = protoimpl.X.CompressGZIP(file_server_server_proto_rawDescData)
	})
	return file_server_server_proto_rawDescData
}

var file_server_server_proto_msgTypes = make([]protoimpl.MessageInfo, 3)
var file_server_server_proto_goTypes = []interface{}{
	(*Entity)(nil),            // 0: Entity
	(*GetEntityRequest)(nil),  // 1: GetEntityRequest
	(*GetEntityResponse)(nil), // 2: GetEntityResponse
}
var file_server_server_proto_depIdxs = []int32{
	0, // 0: GetEntityResponse.entity:type_name -> Entity
	1, // 1: Service.GetEntity:input_type -> GetEntityRequest
	2, // 2: Service.GetEntity:output_type -> GetEntityResponse
	2, // [2:3] is the sub-list for method output_type
	1, // [1:2] is the sub-list for method input_type
	1, // [1:1] is the sub-list for extension type_name
	1, // [1:1] is the sub-list for extension extendee
	0, // [0:1] is the sub-list for field type_name
}

func init() { file_server_server_proto_init() }
func file_server_server_proto_init() {
	if File_server_server_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_server_server_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Entity); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_server_server_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetEntityRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_server_server_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetEntityResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_server_server_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   3,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_server_server_proto_goTypes,
		DependencyIndexes: file_server_server_proto_depIdxs,
		MessageInfos:      file_server_server_proto_msgTypes,
	}.Build()
	File_server_server_proto = out.File
	file_server_server_proto_rawDesc = nil
	file_server_server_proto_goTypes = nil
	file_server_server_proto_depIdxs = nil
}
