// @generated by protoc-gen-es v1.3.0 with parameter "target=ts"
// @generated from file server/v1/server.proto (package server.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import type { BinaryReadOptions, FieldList, JsonReadOptions, JsonValue, PartialMessage, PlainMessage } from "@bufbuild/protobuf";
import { Message, proto3 } from "@bufbuild/protobuf";

/**
 * @generated from message server.v1.Village
 */
export class Village extends Message<Village> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  /**
   * @generated from field: server.v1.Resources resources = 2;
   */
  resources?: Resources;

  /**
   * @generated from field: repeated server.v1.Building buildings = 3;
   */
  buildings: Building[] = [];

  /**
   * @generated from field: repeated server.v1.Troop troops = 4;
   */
  troops: Troop[] = [];

  /**
   * @generated from field: repeated server.v1.Troop.TrainingOrder troop_training_orders = 5;
   */
  troopTrainingOrders: Troop_TrainingOrder[] = [];

  constructor(data?: PartialMessage<Village>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.Village";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: "resources", kind: "message", T: Resources },
    { no: 3, name: "buildings", kind: "message", T: Building, repeated: true },
    { no: 4, name: "troops", kind: "message", T: Troop, repeated: true },
    { no: 5, name: "troop_training_orders", kind: "message", T: Troop_TrainingOrder, repeated: true },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Village {
    return new Village().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Village {
    return new Village().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Village {
    return new Village().fromJsonString(jsonString, options);
  }

  static equals(a: Village | PlainMessage<Village> | undefined, b: Village | PlainMessage<Village> | undefined): boolean {
    return proto3.util.equals(Village, a, b);
  }
}

/**
 * @generated from message server.v1.Resources
 */
export class Resources extends Message<Resources> {
  /**
   * @generated from field: uint32 time = 1;
   */
  time = 0;

  /**
   * @generated from field: uint32 gold = 2;
   */
  gold = 0;

  constructor(data?: PartialMessage<Resources>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.Resources";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "time", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: "gold", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Resources {
    return new Resources().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Resources {
    return new Resources().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Resources {
    return new Resources().fromJsonString(jsonString, options);
  }

  static equals(a: Resources | PlainMessage<Resources> | undefined, b: Resources | PlainMessage<Resources> | undefined): boolean {
    return proto3.util.equals(Resources, a, b);
  }
}

/**
 * @generated from message server.v1.Building
 */
export class Building extends Message<Building> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  /**
   * @generated from field: server.v1.Building.Kind kind = 2;
   */
  kind = Building_Kind.UNSPECIFIED;

  /**
   * @generated from field: string name = 3;
   */
  name = "";

  /**
   * @generated from field: uint32 level = 4;
   */
  level = 0;

  /**
   * @generated from field: uint32 upgrade_time_left = 5;
   */
  upgradeTimeLeft = 0;

  constructor(data?: PartialMessage<Building>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.Building";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: "kind", kind: "enum", T: proto3.getEnumType(Building_Kind) },
    { no: 3, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "level", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 5, name: "upgrade_time_left", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Building {
    return new Building().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Building {
    return new Building().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Building {
    return new Building().fromJsonString(jsonString, options);
  }

  static equals(a: Building | PlainMessage<Building> | undefined, b: Building | PlainMessage<Building> | undefined): boolean {
    return proto3.util.equals(Building, a, b);
  }
}

/**
 * @generated from enum server.v1.Building.Kind
 */
export enum Building_Kind {
  /**
   * @generated from enum value: KIND_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: KIND_HALL = 1;
   */
  HALL = 1,

  /**
   * @generated from enum value: KIND_GOLD_MINE = 2;
   */
  GOLD_MINE = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(Building_Kind)
proto3.util.setEnumType(Building_Kind, "server.v1.Building.Kind", [
  { no: 0, name: "KIND_UNSPECIFIED" },
  { no: 1, name: "KIND_HALL" },
  { no: 2, name: "KIND_GOLD_MINE" },
]);

/**
 * @generated from message server.v1.Troop
 */
export class Troop extends Message<Troop> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  /**
   * @generated from field: server.v1.Troop.Kind kind = 2;
   */
  kind = Troop_Kind.UNSPECIFIED;

  /**
   * @generated from field: string name = 3;
   */
  name = "";

  /**
   * @generated from field: uint32 quantity = 4;
   */
  quantity = 0;

  constructor(data?: PartialMessage<Troop>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.Troop";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: "kind", kind: "enum", T: proto3.getEnumType(Troop_Kind) },
    { no: 3, name: "name", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "quantity", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Troop {
    return new Troop().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Troop {
    return new Troop().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Troop {
    return new Troop().fromJsonString(jsonString, options);
  }

  static equals(a: Troop | PlainMessage<Troop> | undefined, b: Troop | PlainMessage<Troop> | undefined): boolean {
    return proto3.util.equals(Troop, a, b);
  }
}

/**
 * @generated from enum server.v1.Troop.Kind
 */
export enum Troop_Kind {
  /**
   * @generated from enum value: KIND_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: KIND_LEADER = 1;
   */
  LEADER = 1,
}
// Retrieve enum metadata with: proto3.getEnumType(Troop_Kind)
proto3.util.setEnumType(Troop_Kind, "server.v1.Troop.Kind", [
  { no: 0, name: "KIND_UNSPECIFIED" },
  { no: 1, name: "KIND_LEADER" },
]);

/**
 * @generated from message server.v1.Troop.TrainingOrder
 */
export class Troop_TrainingOrder extends Message<Troop_TrainingOrder> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  /**
   * @generated from field: uint32 quantity = 3;
   */
  quantity = 0;

  /**
   * @generated from field: uint32 time_left = 4;
   */
  timeLeft = 0;

  /**
   * @generated from field: server.v1.Resources cost = 5;
   */
  cost?: Resources;

  /**
   * @generated from field: server.v1.Troop troop = 6;
   */
  troop?: Troop;

  constructor(data?: PartialMessage<Troop_TrainingOrder>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.Troop.TrainingOrder";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 3, name: "quantity", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 4, name: "time_left", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 5, name: "cost", kind: "message", T: Resources },
    { no: 6, name: "troop", kind: "message", T: Troop },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Troop_TrainingOrder {
    return new Troop_TrainingOrder().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Troop_TrainingOrder {
    return new Troop_TrainingOrder().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Troop_TrainingOrder {
    return new Troop_TrainingOrder().fromJsonString(jsonString, options);
  }

  static equals(a: Troop_TrainingOrder | PlainMessage<Troop_TrainingOrder> | undefined, b: Troop_TrainingOrder | PlainMessage<Troop_TrainingOrder> | undefined): boolean {
    return proto3.util.equals(Troop_TrainingOrder, a, b);
  }
}

/**
 * @generated from message server.v1.World
 */
export class World extends Message<World> {
  /**
   * @generated from field: uint32 width = 1;
   */
  width = 0;

  /**
   * @generated from field: uint32 height = 2;
   */
  height = 0;

  /**
   * @generated from field: map<string, server.v1.World.Cell> cells = 3;
   */
  cells: { [key: string]: World_Cell } = {};

  constructor(data?: PartialMessage<World>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.World";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "width", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: "height", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 3, name: "cells", kind: "map", K: 9 /* ScalarType.STRING */, V: {kind: "message", T: World_Cell} },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): World {
    return new World().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): World {
    return new World().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): World {
    return new World().fromJsonString(jsonString, options);
  }

  static equals(a: World | PlainMessage<World> | undefined, b: World | PlainMessage<World> | undefined): boolean {
    return proto3.util.equals(World, a, b);
  }
}

/**
 * @generated from message server.v1.World.Cell
 */
export class World_Cell extends Message<World_Cell> {
  /**
   * @generated from field: string coords = 1;
   */
  coords = "";

  /**
   * @generated from field: uint32 x = 2;
   */
  x = 0;

  /**
   * @generated from field: uint32 y = 3;
   */
  y = 0;

  /**
   * @generated from field: server.v1.World.Cell.EntityKind entity_kind = 4;
   */
  entityKind = World_Cell_EntityKind.UNSPECIFIED;

  /**
   * @generated from field: uint32 entity_id = 5;
   */
  entityId = 0;

  constructor(data?: PartialMessage<World_Cell>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.World.Cell";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "coords", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "x", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 3, name: "y", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 4, name: "entity_kind", kind: "enum", T: proto3.getEnumType(World_Cell_EntityKind) },
    { no: 5, name: "entity_id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): World_Cell {
    return new World_Cell().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): World_Cell {
    return new World_Cell().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): World_Cell {
    return new World_Cell().fromJsonString(jsonString, options);
  }

  static equals(a: World_Cell | PlainMessage<World_Cell> | undefined, b: World_Cell | PlainMessage<World_Cell> | undefined): boolean {
    return proto3.util.equals(World_Cell, a, b);
  }
}

/**
 * @generated from enum server.v1.World.Cell.EntityKind
 */
export enum World_Cell_EntityKind {
  /**
   * @generated from enum value: ENTITY_KIND_UNSPECIFIED = 0;
   */
  UNSPECIFIED = 0,

  /**
   * @generated from enum value: ENTITY_KIND_VILLAGE = 1;
   */
  VILLAGE = 1,

  /**
   * @generated from enum value: ENTITY_KIND_TEMPLE = 2;
   */
  TEMPLE = 2,
}
// Retrieve enum metadata with: proto3.getEnumType(World_Cell_EntityKind)
proto3.util.setEnumType(World_Cell_EntityKind, "server.v1.World.Cell.EntityKind", [
  { no: 0, name: "ENTITY_KIND_UNSPECIFIED" },
  { no: 1, name: "ENTITY_KIND_VILLAGE" },
  { no: 2, name: "ENTITY_KIND_TEMPLE" },
]);

/**
 * @generated from message server.v1.Temple
 */
export class Temple extends Message<Temple> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  constructor(data?: PartialMessage<Temple>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.Temple";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): Temple {
    return new Temple().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): Temple {
    return new Temple().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): Temple {
    return new Temple().fromJsonString(jsonString, options);
  }

  static equals(a: Temple | PlainMessage<Temple> | undefined, b: Temple | PlainMessage<Temple> | undefined): boolean {
    return proto3.util.equals(Temple, a, b);
  }
}

/**
 * GetVillage
 *
 * @generated from message server.v1.GetVillageRequest
 */
export class GetVillageRequest extends Message<GetVillageRequest> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  constructor(data?: PartialMessage<GetVillageRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.GetVillageRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetVillageRequest {
    return new GetVillageRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetVillageRequest {
    return new GetVillageRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetVillageRequest {
    return new GetVillageRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetVillageRequest | PlainMessage<GetVillageRequest> | undefined, b: GetVillageRequest | PlainMessage<GetVillageRequest> | undefined): boolean {
    return proto3.util.equals(GetVillageRequest, a, b);
  }
}

/**
 * @generated from message server.v1.GetVillageResponse
 */
export class GetVillageResponse extends Message<GetVillageResponse> {
  /**
   * @generated from field: server.v1.Village Village = 1;
   */
  Village?: Village;

  constructor(data?: PartialMessage<GetVillageResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.GetVillageResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "Village", kind: "message", T: Village },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetVillageResponse {
    return new GetVillageResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetVillageResponse {
    return new GetVillageResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetVillageResponse {
    return new GetVillageResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetVillageResponse | PlainMessage<GetVillageResponse> | undefined, b: GetVillageResponse | PlainMessage<GetVillageResponse> | undefined): boolean {
    return proto3.util.equals(GetVillageResponse, a, b);
  }
}

/**
 * UpgradeBuilding
 *
 * @generated from message server.v1.UpgradeBuildingRequest
 */
export class UpgradeBuildingRequest extends Message<UpgradeBuildingRequest> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  constructor(data?: PartialMessage<UpgradeBuildingRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.UpgradeBuildingRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): UpgradeBuildingRequest {
    return new UpgradeBuildingRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): UpgradeBuildingRequest {
    return new UpgradeBuildingRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): UpgradeBuildingRequest {
    return new UpgradeBuildingRequest().fromJsonString(jsonString, options);
  }

  static equals(a: UpgradeBuildingRequest | PlainMessage<UpgradeBuildingRequest> | undefined, b: UpgradeBuildingRequest | PlainMessage<UpgradeBuildingRequest> | undefined): boolean {
    return proto3.util.equals(UpgradeBuildingRequest, a, b);
  }
}

/**
 * @generated from message server.v1.UpgradeBuildingResponse
 */
export class UpgradeBuildingResponse extends Message<UpgradeBuildingResponse> {
  /**
   * @generated from field: server.v1.Building building = 1;
   */
  building?: Building;

  constructor(data?: PartialMessage<UpgradeBuildingResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.UpgradeBuildingResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "building", kind: "message", T: Building },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): UpgradeBuildingResponse {
    return new UpgradeBuildingResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): UpgradeBuildingResponse {
    return new UpgradeBuildingResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): UpgradeBuildingResponse {
    return new UpgradeBuildingResponse().fromJsonString(jsonString, options);
  }

  static equals(a: UpgradeBuildingResponse | PlainMessage<UpgradeBuildingResponse> | undefined, b: UpgradeBuildingResponse | PlainMessage<UpgradeBuildingResponse> | undefined): boolean {
    return proto3.util.equals(UpgradeBuildingResponse, a, b);
  }
}

/**
 * CancelUpgradeBuilding
 *
 * @generated from message server.v1.CancelUpgradeBuildingRequest
 */
export class CancelUpgradeBuildingRequest extends Message<CancelUpgradeBuildingRequest> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  constructor(data?: PartialMessage<CancelUpgradeBuildingRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.CancelUpgradeBuildingRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CancelUpgradeBuildingRequest {
    return new CancelUpgradeBuildingRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CancelUpgradeBuildingRequest {
    return new CancelUpgradeBuildingRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CancelUpgradeBuildingRequest {
    return new CancelUpgradeBuildingRequest().fromJsonString(jsonString, options);
  }

  static equals(a: CancelUpgradeBuildingRequest | PlainMessage<CancelUpgradeBuildingRequest> | undefined, b: CancelUpgradeBuildingRequest | PlainMessage<CancelUpgradeBuildingRequest> | undefined): boolean {
    return proto3.util.equals(CancelUpgradeBuildingRequest, a, b);
  }
}

/**
 * @generated from message server.v1.CancelUpgradeBuildingResponse
 */
export class CancelUpgradeBuildingResponse extends Message<CancelUpgradeBuildingResponse> {
  /**
   * @generated from field: server.v1.Building building = 1;
   */
  building?: Building;

  constructor(data?: PartialMessage<CancelUpgradeBuildingResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.CancelUpgradeBuildingResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "building", kind: "message", T: Building },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CancelUpgradeBuildingResponse {
    return new CancelUpgradeBuildingResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CancelUpgradeBuildingResponse {
    return new CancelUpgradeBuildingResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CancelUpgradeBuildingResponse {
    return new CancelUpgradeBuildingResponse().fromJsonString(jsonString, options);
  }

  static equals(a: CancelUpgradeBuildingResponse | PlainMessage<CancelUpgradeBuildingResponse> | undefined, b: CancelUpgradeBuildingResponse | PlainMessage<CancelUpgradeBuildingResponse> | undefined): boolean {
    return proto3.util.equals(CancelUpgradeBuildingResponse, a, b);
  }
}

/**
 * IssueTroopTrainingOrder
 *
 * @generated from message server.v1.IssueTroopTrainingOrderRequest
 */
export class IssueTroopTrainingOrderRequest extends Message<IssueTroopTrainingOrderRequest> {
  /**
   * @generated from field: uint32 troop_id = 1;
   */
  troopId = 0;

  /**
   * @generated from field: uint32 quantity = 2;
   */
  quantity = 0;

  constructor(data?: PartialMessage<IssueTroopTrainingOrderRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.IssueTroopTrainingOrderRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "troop_id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
    { no: 2, name: "quantity", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IssueTroopTrainingOrderRequest {
    return new IssueTroopTrainingOrderRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IssueTroopTrainingOrderRequest {
    return new IssueTroopTrainingOrderRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IssueTroopTrainingOrderRequest {
    return new IssueTroopTrainingOrderRequest().fromJsonString(jsonString, options);
  }

  static equals(a: IssueTroopTrainingOrderRequest | PlainMessage<IssueTroopTrainingOrderRequest> | undefined, b: IssueTroopTrainingOrderRequest | PlainMessage<IssueTroopTrainingOrderRequest> | undefined): boolean {
    return proto3.util.equals(IssueTroopTrainingOrderRequest, a, b);
  }
}

/**
 * @generated from message server.v1.IssueTroopTrainingOrderResponse
 */
export class IssueTroopTrainingOrderResponse extends Message<IssueTroopTrainingOrderResponse> {
  /**
   * @generated from field: server.v1.Troop.TrainingOrder order = 1;
   */
  order?: Troop_TrainingOrder;

  constructor(data?: PartialMessage<IssueTroopTrainingOrderResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.IssueTroopTrainingOrderResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "order", kind: "message", T: Troop_TrainingOrder },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): IssueTroopTrainingOrderResponse {
    return new IssueTroopTrainingOrderResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): IssueTroopTrainingOrderResponse {
    return new IssueTroopTrainingOrderResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): IssueTroopTrainingOrderResponse {
    return new IssueTroopTrainingOrderResponse().fromJsonString(jsonString, options);
  }

  static equals(a: IssueTroopTrainingOrderResponse | PlainMessage<IssueTroopTrainingOrderResponse> | undefined, b: IssueTroopTrainingOrderResponse | PlainMessage<IssueTroopTrainingOrderResponse> | undefined): boolean {
    return proto3.util.equals(IssueTroopTrainingOrderResponse, a, b);
  }
}

/**
 * CancelTroopTrainingOrder
 *
 * @generated from message server.v1.CancelTroopTrainingOrderRequest
 */
export class CancelTroopTrainingOrderRequest extends Message<CancelTroopTrainingOrderRequest> {
  /**
   * @generated from field: uint32 id = 1;
   */
  id = 0;

  constructor(data?: PartialMessage<CancelTroopTrainingOrderRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.CancelTroopTrainingOrderRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "id", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CancelTroopTrainingOrderRequest {
    return new CancelTroopTrainingOrderRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CancelTroopTrainingOrderRequest {
    return new CancelTroopTrainingOrderRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CancelTroopTrainingOrderRequest {
    return new CancelTroopTrainingOrderRequest().fromJsonString(jsonString, options);
  }

  static equals(a: CancelTroopTrainingOrderRequest | PlainMessage<CancelTroopTrainingOrderRequest> | undefined, b: CancelTroopTrainingOrderRequest | PlainMessage<CancelTroopTrainingOrderRequest> | undefined): boolean {
    return proto3.util.equals(CancelTroopTrainingOrderRequest, a, b);
  }
}

/**
 * @generated from message server.v1.CancelTroopTrainingOrderResponse
 */
export class CancelTroopTrainingOrderResponse extends Message<CancelTroopTrainingOrderResponse> {
  constructor(data?: PartialMessage<CancelTroopTrainingOrderResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.CancelTroopTrainingOrderResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): CancelTroopTrainingOrderResponse {
    return new CancelTroopTrainingOrderResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): CancelTroopTrainingOrderResponse {
    return new CancelTroopTrainingOrderResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): CancelTroopTrainingOrderResponse {
    return new CancelTroopTrainingOrderResponse().fromJsonString(jsonString, options);
  }

  static equals(a: CancelTroopTrainingOrderResponse | PlainMessage<CancelTroopTrainingOrderResponse> | undefined, b: CancelTroopTrainingOrderResponse | PlainMessage<CancelTroopTrainingOrderResponse> | undefined): boolean {
    return proto3.util.equals(CancelTroopTrainingOrderResponse, a, b);
  }
}

/**
 * GetWorld
 *
 * @generated from message server.v1.GetWorldRequest
 */
export class GetWorldRequest extends Message<GetWorldRequest> {
  /**
   * @generated from field: bool load_cells = 1;
   */
  loadCells = false;

  constructor(data?: PartialMessage<GetWorldRequest>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.GetWorldRequest";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "load_cells", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetWorldRequest {
    return new GetWorldRequest().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetWorldRequest {
    return new GetWorldRequest().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetWorldRequest {
    return new GetWorldRequest().fromJsonString(jsonString, options);
  }

  static equals(a: GetWorldRequest | PlainMessage<GetWorldRequest> | undefined, b: GetWorldRequest | PlainMessage<GetWorldRequest> | undefined): boolean {
    return proto3.util.equals(GetWorldRequest, a, b);
  }
}

/**
 * @generated from message server.v1.GetWorldResponse
 */
export class GetWorldResponse extends Message<GetWorldResponse> {
  /**
   * @generated from field: server.v1.World world = 1;
   */
  world?: World;

  constructor(data?: PartialMessage<GetWorldResponse>) {
    super();
    proto3.util.initPartial(data, this);
  }

  static readonly runtime: typeof proto3 = proto3;
  static readonly typeName = "server.v1.GetWorldResponse";
  static readonly fields: FieldList = proto3.util.newFieldList(() => [
    { no: 1, name: "world", kind: "message", T: World },
  ]);

  static fromBinary(bytes: Uint8Array, options?: Partial<BinaryReadOptions>): GetWorldResponse {
    return new GetWorldResponse().fromBinary(bytes, options);
  }

  static fromJson(jsonValue: JsonValue, options?: Partial<JsonReadOptions>): GetWorldResponse {
    return new GetWorldResponse().fromJson(jsonValue, options);
  }

  static fromJsonString(jsonString: string, options?: Partial<JsonReadOptions>): GetWorldResponse {
    return new GetWorldResponse().fromJsonString(jsonString, options);
  }

  static equals(a: GetWorldResponse | PlainMessage<GetWorldResponse> | undefined, b: GetWorldResponse | PlainMessage<GetWorldResponse> | undefined): boolean {
    return proto3.util.equals(GetWorldResponse, a, b);
  }
}

