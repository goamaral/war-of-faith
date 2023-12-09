// @generated by protoc-gen-connect-es v0.12.0 with parameter "target=ts"
// @generated from file server/v1/server.proto (package server.v1, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { AttackRequest, AttackResponse, CancelBuildingUpgradeOrderRequest, CancelBuildingUpgradeOrderResponse, CancelTroopTrainingOrderRequest, CancelTroopTrainingOrderResponse, GetTroopsRequest, GetTroopsResponse, GetVillageRequest, GetVillageResponse, GetWorldRequest, GetWorldResponse, IssueBuildingUpgradeOrderRequest, IssueBuildingUpgradeOrderResponse, IssueTroopTrainingOrderRequest, IssueTroopTrainingOrderResponse } from "./server_pb.js";
import { MethodKind } from "@bufbuild/protobuf";

/**
 * @generated from service server.v1.Service
 */
export const Service = {
  typeName: "server.v1.Service",
  methods: {
    /**
     * VILLAGES 
     *
     * @generated from rpc server.v1.Service.GetVillage
     */
    getVillage: {
      name: "GetVillage",
      I: GetVillageRequest,
      O: GetVillageResponse,
      kind: MethodKind.Unary,
    },
    /**
     * ORDERS 
     *
     * @generated from rpc server.v1.Service.IssueBuildingUpgradeOrder
     */
    issueBuildingUpgradeOrder: {
      name: "IssueBuildingUpgradeOrder",
      I: IssueBuildingUpgradeOrderRequest,
      O: IssueBuildingUpgradeOrderResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc server.v1.Service.CancelBuildingUpgradeOrder
     */
    cancelBuildingUpgradeOrder: {
      name: "CancelBuildingUpgradeOrder",
      I: CancelBuildingUpgradeOrderRequest,
      O: CancelBuildingUpgradeOrderResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc server.v1.Service.IssueTroopTrainingOrder
     */
    issueTroopTrainingOrder: {
      name: "IssueTroopTrainingOrder",
      I: IssueTroopTrainingOrderRequest,
      O: IssueTroopTrainingOrderResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc server.v1.Service.CancelTroopTrainingOrder
     */
    cancelTroopTrainingOrder: {
      name: "CancelTroopTrainingOrder",
      I: CancelTroopTrainingOrderRequest,
      O: CancelTroopTrainingOrderResponse,
      kind: MethodKind.Unary,
    },
    /**
     * TROOPS 
     *
     * @generated from rpc server.v1.Service.GetTroops
     */
    getTroops: {
      name: "GetTroops",
      I: GetTroopsRequest,
      O: GetTroopsResponse,
      kind: MethodKind.Unary,
    },
    /**
     * WORLD 
     *
     * @generated from rpc server.v1.Service.GetWorld
     */
    getWorld: {
      name: "GetWorld",
      I: GetWorldRequest,
      O: GetWorldResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc server.v1.Service.Attack
     */
    attack: {
      name: "Attack",
      I: AttackRequest,
      O: AttackResponse,
      kind: MethodKind.Unary,
    },
  }
} as const;

