// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        (unknown)
// source: server/v1/server.proto

package serverv1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	wrapperspb "google.golang.org/protobuf/types/known/wrapperspb"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type Building_Kind int32

const (
	Building_KIND_UNSPECIFIED Building_Kind = 0
	Building_KIND_HALL        Building_Kind = 1
	Building_KIND_GOLD_MINE   Building_Kind = 2
)

// Enum value maps for Building_Kind.
var (
	Building_Kind_name = map[int32]string{
		0: "KIND_UNSPECIFIED",
		1: "KIND_HALL",
		2: "KIND_GOLD_MINE",
	}
	Building_Kind_value = map[string]int32{
		"KIND_UNSPECIFIED": 0,
		"KIND_HALL":        1,
		"KIND_GOLD_MINE":   2,
	}
)

func (x Building_Kind) Enum() *Building_Kind {
	p := new(Building_Kind)
	*p = x
	return p
}

func (x Building_Kind) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (Building_Kind) Descriptor() protoreflect.EnumDescriptor {
	return file_server_v1_server_proto_enumTypes[0].Descriptor()
}

func (Building_Kind) Type() protoreflect.EnumType {
	return &file_server_v1_server_proto_enumTypes[0]
}

func (x Building_Kind) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use Building_Kind.Descriptor instead.
func (Building_Kind) EnumDescriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{1, 0}
}

type Resources struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Gold uint32 `protobuf:"varint,1,opt,name=gold,proto3" json:"gold,omitempty"`
}

func (x *Resources) Reset() {
	*x = Resources{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Resources) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Resources) ProtoMessage() {}

func (x *Resources) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Resources.ProtoReflect.Descriptor instead.
func (*Resources) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{0}
}

func (x *Resources) GetGold() uint32 {
	if x != nil {
		return x.Gold
	}
	return 0
}

type Building struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id              uint32        `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
	Kind            Building_Kind `protobuf:"varint,2,opt,name=kind,proto3,enum=server.v1.Building_Kind" json:"kind,omitempty"`
	Level           uint32        `protobuf:"varint,3,opt,name=level,proto3" json:"level,omitempty"`
	VillageId       uint32        `protobuf:"varint,4,opt,name=village_id,json=villageId,proto3" json:"village_id,omitempty"`
	IsUpgradable    bool          `protobuf:"varint,5,opt,name=is_upgradable,json=isUpgradable,proto3" json:"is_upgradable,omitempty"`
	UpgradeTimeLeft uint32        `protobuf:"varint,6,opt,name=upgrade_time_left,json=upgradeTimeLeft,proto3" json:"upgrade_time_left,omitempty"`
	UpgradeCost     *Resources    `protobuf:"bytes,7,opt,name=upgrade_cost,json=upgradeCost,proto3" json:"upgrade_cost,omitempty"`
}

func (x *Building) Reset() {
	*x = Building{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Building) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Building) ProtoMessage() {}

func (x *Building) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Building.ProtoReflect.Descriptor instead.
func (*Building) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{1}
}

func (x *Building) GetId() uint32 {
	if x != nil {
		return x.Id
	}
	return 0
}

func (x *Building) GetKind() Building_Kind {
	if x != nil {
		return x.Kind
	}
	return Building_KIND_UNSPECIFIED
}

func (x *Building) GetLevel() uint32 {
	if x != nil {
		return x.Level
	}
	return 0
}

func (x *Building) GetVillageId() uint32 {
	if x != nil {
		return x.VillageId
	}
	return 0
}

func (x *Building) GetIsUpgradable() bool {
	if x != nil {
		return x.IsUpgradable
	}
	return false
}

func (x *Building) GetUpgradeTimeLeft() uint32 {
	if x != nil {
		return x.UpgradeTimeLeft
	}
	return 0
}

func (x *Building) GetUpgradeCost() *Resources {
	if x != nil {
		return x.UpgradeCost
	}
	return nil
}

type Village struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id        uint32      `protobuf:"varint,1,opt,name=id,proto3" json:"id,omitempty"`
	Resources *Resources  `protobuf:"bytes,2,opt,name=resources,proto3" json:"resources,omitempty"`
	Buildings []*Building `protobuf:"bytes,3,rep,name=buildings,proto3" json:"buildings,omitempty"`
}

func (x *Village) Reset() {
	*x = Village{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *Village) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*Village) ProtoMessage() {}

func (x *Village) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use Village.ProtoReflect.Descriptor instead.
func (*Village) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{2}
}

func (x *Village) GetId() uint32 {
	if x != nil {
		return x.Id
	}
	return 0
}

func (x *Village) GetResources() *Resources {
	if x != nil {
		return x.Resources
	}
	return nil
}

func (x *Village) GetBuildings() []*Building {
	if x != nil {
		return x.Buildings
	}
	return nil
}

// GetVillage
type GetVillageRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Id *wrapperspb.UInt32Value `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
}

func (x *GetVillageRequest) Reset() {
	*x = GetVillageRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetVillageRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetVillageRequest) ProtoMessage() {}

func (x *GetVillageRequest) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetVillageRequest.ProtoReflect.Descriptor instead.
func (*GetVillageRequest) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{3}
}

func (x *GetVillageRequest) GetId() *wrapperspb.UInt32Value {
	if x != nil {
		return x.Id
	}
	return nil
}

type GetVillageResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Village *Village `protobuf:"bytes,1,opt,name=Village,proto3" json:"Village,omitempty"`
}

func (x *GetVillageResponse) Reset() {
	*x = GetVillageResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *GetVillageResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*GetVillageResponse) ProtoMessage() {}

func (x *GetVillageResponse) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use GetVillageResponse.ProtoReflect.Descriptor instead.
func (*GetVillageResponse) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{4}
}

func (x *GetVillageResponse) GetVillage() *Village {
	if x != nil {
		return x.Village
	}
	return nil
}

// UpgradeBuilding
type UpgradeBuildingRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	VillageId uint32        `protobuf:"varint,1,opt,name=village_id,json=villageId,proto3" json:"village_id,omitempty"`
	Kind      Building_Kind `protobuf:"varint,2,opt,name=kind,proto3,enum=server.v1.Building_Kind" json:"kind,omitempty"`
}

func (x *UpgradeBuildingRequest) Reset() {
	*x = UpgradeBuildingRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UpgradeBuildingRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpgradeBuildingRequest) ProtoMessage() {}

func (x *UpgradeBuildingRequest) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpgradeBuildingRequest.ProtoReflect.Descriptor instead.
func (*UpgradeBuildingRequest) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{5}
}

func (x *UpgradeBuildingRequest) GetVillageId() uint32 {
	if x != nil {
		return x.VillageId
	}
	return 0
}

func (x *UpgradeBuildingRequest) GetKind() Building_Kind {
	if x != nil {
		return x.Kind
	}
	return Building_KIND_UNSPECIFIED
}

type UpgradeBuildingResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Building *Building `protobuf:"bytes,1,opt,name=building,proto3" json:"building,omitempty"`
	Upgraded bool      `protobuf:"varint,2,opt,name=upgraded,proto3" json:"upgraded,omitempty"`
}

func (x *UpgradeBuildingResponse) Reset() {
	*x = UpgradeBuildingResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_server_v1_server_proto_msgTypes[6]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *UpgradeBuildingResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*UpgradeBuildingResponse) ProtoMessage() {}

func (x *UpgradeBuildingResponse) ProtoReflect() protoreflect.Message {
	mi := &file_server_v1_server_proto_msgTypes[6]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use UpgradeBuildingResponse.ProtoReflect.Descriptor instead.
func (*UpgradeBuildingResponse) Descriptor() ([]byte, []int) {
	return file_server_v1_server_proto_rawDescGZIP(), []int{6}
}

func (x *UpgradeBuildingResponse) GetBuilding() *Building {
	if x != nil {
		return x.Building
	}
	return nil
}

func (x *UpgradeBuildingResponse) GetUpgraded() bool {
	if x != nil {
		return x.Upgraded
	}
	return false
}

var File_server_v1_server_proto protoreflect.FileDescriptor

var file_server_v1_server_proto_rawDesc = []byte{
	0x0a, 0x16, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2f, 0x76, 0x31, 0x2f, 0x73, 0x65, 0x72, 0x76,
	0x65, 0x72, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x09, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72,
	0x2e, 0x76, 0x31, 0x1a, 0x1e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x62, 0x75, 0x66, 0x2f, 0x77, 0x72, 0x61, 0x70, 0x70, 0x65, 0x72, 0x73, 0x2e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x22, 0x1f, 0x0a, 0x09, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73,
	0x12, 0x12, 0x0a, 0x04, 0x67, 0x6f, 0x6c, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x04,
	0x67, 0x6f, 0x6c, 0x64, 0x22, 0xc8, 0x02, 0x0a, 0x08, 0x42, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e,
	0x67, 0x12, 0x0e, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x02, 0x69,
	0x64, 0x12, 0x2c, 0x0a, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0e, 0x32,
	0x18, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x42, 0x75, 0x69, 0x6c,
	0x64, 0x69, 0x6e, 0x67, 0x2e, 0x4b, 0x69, 0x6e, 0x64, 0x52, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x12,
	0x14, 0x0a, 0x05, 0x6c, 0x65, 0x76, 0x65, 0x6c, 0x18, 0x03, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x05,
	0x6c, 0x65, 0x76, 0x65, 0x6c, 0x12, 0x1d, 0x0a, 0x0a, 0x76, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65,
	0x5f, 0x69, 0x64, 0x18, 0x04, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x09, 0x76, 0x69, 0x6c, 0x6c, 0x61,
	0x67, 0x65, 0x49, 0x64, 0x12, 0x23, 0x0a, 0x0d, 0x69, 0x73, 0x5f, 0x75, 0x70, 0x67, 0x72, 0x61,
	0x64, 0x61, 0x62, 0x6c, 0x65, 0x18, 0x05, 0x20, 0x01, 0x28, 0x08, 0x52, 0x0c, 0x69, 0x73, 0x55,
	0x70, 0x67, 0x72, 0x61, 0x64, 0x61, 0x62, 0x6c, 0x65, 0x12, 0x2a, 0x0a, 0x11, 0x75, 0x70, 0x67,
	0x72, 0x61, 0x64, 0x65, 0x5f, 0x74, 0x69, 0x6d, 0x65, 0x5f, 0x6c, 0x65, 0x66, 0x74, 0x18, 0x06,
	0x20, 0x01, 0x28, 0x0d, 0x52, 0x0f, 0x75, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x54, 0x69, 0x6d,
	0x65, 0x4c, 0x65, 0x66, 0x74, 0x12, 0x37, 0x0a, 0x0c, 0x75, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65,
	0x5f, 0x63, 0x6f, 0x73, 0x74, 0x18, 0x07, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x14, 0x2e, 0x73, 0x65,
	0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x52, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65,
	0x73, 0x52, 0x0b, 0x75, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x43, 0x6f, 0x73, 0x74, 0x22, 0x3f,
	0x0a, 0x04, 0x4b, 0x69, 0x6e, 0x64, 0x12, 0x14, 0x0a, 0x10, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x55,
	0x4e, 0x53, 0x50, 0x45, 0x43, 0x49, 0x46, 0x49, 0x45, 0x44, 0x10, 0x00, 0x12, 0x0d, 0x0a, 0x09,
	0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x48, 0x41, 0x4c, 0x4c, 0x10, 0x01, 0x12, 0x12, 0x0a, 0x0e, 0x4b,
	0x49, 0x4e, 0x44, 0x5f, 0x47, 0x4f, 0x4c, 0x44, 0x5f, 0x4d, 0x49, 0x4e, 0x45, 0x10, 0x02, 0x22,
	0x80, 0x01, 0x0a, 0x07, 0x56, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65, 0x12, 0x0e, 0x0a, 0x02, 0x69,
	0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x02, 0x69, 0x64, 0x12, 0x32, 0x0a, 0x09, 0x72,
	0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x14,
	0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x52, 0x65, 0x73, 0x6f, 0x75,
	0x72, 0x63, 0x65, 0x73, 0x52, 0x09, 0x72, 0x65, 0x73, 0x6f, 0x75, 0x72, 0x63, 0x65, 0x73, 0x12,
	0x31, 0x0a, 0x09, 0x62, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x73, 0x18, 0x03, 0x20, 0x03,
	0x28, 0x0b, 0x32, 0x13, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x42,
	0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x52, 0x09, 0x62, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e,
	0x67, 0x73, 0x22, 0x41, 0x0a, 0x11, 0x47, 0x65, 0x74, 0x56, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x2c, 0x0a, 0x02, 0x69, 0x64, 0x18, 0x01, 0x20,
	0x01, 0x28, 0x0b, 0x32, 0x1c, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70, 0x72, 0x6f,
	0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x55, 0x49, 0x6e, 0x74, 0x33, 0x32, 0x56, 0x61, 0x6c, 0x75,
	0x65, 0x52, 0x02, 0x69, 0x64, 0x22, 0x42, 0x0a, 0x12, 0x47, 0x65, 0x74, 0x56, 0x69, 0x6c, 0x6c,
	0x61, 0x67, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x2c, 0x0a, 0x07, 0x56,
	0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x12, 0x2e, 0x73,
	0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x56, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65,
	0x52, 0x07, 0x56, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65, 0x22, 0x65, 0x0a, 0x16, 0x55, 0x70, 0x67,
	0x72, 0x61, 0x64, 0x65, 0x42, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x12, 0x1d, 0x0a, 0x0a, 0x76, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65, 0x5f, 0x69,
	0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x09, 0x76, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65,
	0x49, 0x64, 0x12, 0x2c, 0x0a, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0e,
	0x32, 0x18, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x42, 0x75, 0x69,
	0x6c, 0x64, 0x69, 0x6e, 0x67, 0x2e, 0x4b, 0x69, 0x6e, 0x64, 0x52, 0x04, 0x6b, 0x69, 0x6e, 0x64,
	0x22, 0x66, 0x0a, 0x17, 0x55, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x42, 0x75, 0x69, 0x6c, 0x64,
	0x69, 0x6e, 0x67, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x2f, 0x0a, 0x08, 0x62,
	0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x13, 0x2e,
	0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x42, 0x75, 0x69, 0x6c, 0x64, 0x69,
	0x6e, 0x67, 0x52, 0x08, 0x62, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x12, 0x1a, 0x0a, 0x08,
	0x75, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x08, 0x52, 0x08,
	0x75, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x64, 0x32, 0xae, 0x01, 0x0a, 0x07, 0x53, 0x65, 0x72,
	0x76, 0x69, 0x63, 0x65, 0x12, 0x49, 0x0a, 0x0a, 0x47, 0x65, 0x74, 0x56, 0x69, 0x6c, 0x6c, 0x61,
	0x67, 0x65, 0x12, 0x1c, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x47,
	0x65, 0x74, 0x56, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74,
	0x1a, 0x1d, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x47, 0x65, 0x74,
	0x56, 0x69, 0x6c, 0x6c, 0x61, 0x67, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12,
	0x58, 0x0a, 0x0f, 0x55, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x42, 0x75, 0x69, 0x6c, 0x64, 0x69,
	0x6e, 0x67, 0x12, 0x21, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76, 0x31, 0x2e, 0x55,
	0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x42, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e, 0x67, 0x52, 0x65,
	0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x22, 0x2e, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2e, 0x76,
	0x31, 0x2e, 0x55, 0x70, 0x67, 0x72, 0x61, 0x64, 0x65, 0x42, 0x75, 0x69, 0x6c, 0x64, 0x69, 0x6e,
	0x67, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0x2e, 0x5a, 0x2c, 0x77, 0x61, 0x72,
	0x2d, 0x6f, 0x66, 0x2d, 0x66, 0x61, 0x69, 0x74, 0x68, 0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2f, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x2f, 0x76, 0x31,
	0x3b, 0x73, 0x65, 0x72, 0x76, 0x65, 0x72, 0x76, 0x31, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x33,
}

var (
	file_server_v1_server_proto_rawDescOnce sync.Once
	file_server_v1_server_proto_rawDescData = file_server_v1_server_proto_rawDesc
)

func file_server_v1_server_proto_rawDescGZIP() []byte {
	file_server_v1_server_proto_rawDescOnce.Do(func() {
		file_server_v1_server_proto_rawDescData = protoimpl.X.CompressGZIP(file_server_v1_server_proto_rawDescData)
	})
	return file_server_v1_server_proto_rawDescData
}

var file_server_v1_server_proto_enumTypes = make([]protoimpl.EnumInfo, 1)
var file_server_v1_server_proto_msgTypes = make([]protoimpl.MessageInfo, 7)
var file_server_v1_server_proto_goTypes = []interface{}{
	(Building_Kind)(0),              // 0: server.v1.Building.Kind
	(*Resources)(nil),               // 1: server.v1.Resources
	(*Building)(nil),                // 2: server.v1.Building
	(*Village)(nil),                 // 3: server.v1.Village
	(*GetVillageRequest)(nil),       // 4: server.v1.GetVillageRequest
	(*GetVillageResponse)(nil),      // 5: server.v1.GetVillageResponse
	(*UpgradeBuildingRequest)(nil),  // 6: server.v1.UpgradeBuildingRequest
	(*UpgradeBuildingResponse)(nil), // 7: server.v1.UpgradeBuildingResponse
	(*wrapperspb.UInt32Value)(nil),  // 8: google.protobuf.UInt32Value
}
var file_server_v1_server_proto_depIdxs = []int32{
	0,  // 0: server.v1.Building.kind:type_name -> server.v1.Building.Kind
	1,  // 1: server.v1.Building.upgrade_cost:type_name -> server.v1.Resources
	1,  // 2: server.v1.Village.resources:type_name -> server.v1.Resources
	2,  // 3: server.v1.Village.buildings:type_name -> server.v1.Building
	8,  // 4: server.v1.GetVillageRequest.id:type_name -> google.protobuf.UInt32Value
	3,  // 5: server.v1.GetVillageResponse.Village:type_name -> server.v1.Village
	0,  // 6: server.v1.UpgradeBuildingRequest.kind:type_name -> server.v1.Building.Kind
	2,  // 7: server.v1.UpgradeBuildingResponse.building:type_name -> server.v1.Building
	4,  // 8: server.v1.Service.GetVillage:input_type -> server.v1.GetVillageRequest
	6,  // 9: server.v1.Service.UpgradeBuilding:input_type -> server.v1.UpgradeBuildingRequest
	5,  // 10: server.v1.Service.GetVillage:output_type -> server.v1.GetVillageResponse
	7,  // 11: server.v1.Service.UpgradeBuilding:output_type -> server.v1.UpgradeBuildingResponse
	10, // [10:12] is the sub-list for method output_type
	8,  // [8:10] is the sub-list for method input_type
	8,  // [8:8] is the sub-list for extension type_name
	8,  // [8:8] is the sub-list for extension extendee
	0,  // [0:8] is the sub-list for field type_name
}

func init() { file_server_v1_server_proto_init() }
func file_server_v1_server_proto_init() {
	if File_server_v1_server_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_server_v1_server_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Resources); i {
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
		file_server_v1_server_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Building); i {
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
		file_server_v1_server_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*Village); i {
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
		file_server_v1_server_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetVillageRequest); i {
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
		file_server_v1_server_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*GetVillageResponse); i {
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
		file_server_v1_server_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UpgradeBuildingRequest); i {
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
		file_server_v1_server_proto_msgTypes[6].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*UpgradeBuildingResponse); i {
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
			RawDescriptor: file_server_v1_server_proto_rawDesc,
			NumEnums:      1,
			NumMessages:   7,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_server_v1_server_proto_goTypes,
		DependencyIndexes: file_server_v1_server_proto_depIdxs,
		EnumInfos:         file_server_v1_server_proto_enumTypes,
		MessageInfos:      file_server_v1_server_proto_msgTypes,
	}.Build()
	File_server_v1_server_proto = out.File
	file_server_v1_server_proto_rawDesc = nil
	file_server_v1_server_proto_goTypes = nil
	file_server_v1_server_proto_depIdxs = nil
}
