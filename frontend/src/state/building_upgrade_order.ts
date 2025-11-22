import { ok, err, ResultAsync } from "neverthrow"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { add, sub } from '../helpers'
import { Mutator } from './mutator'

export namespace IssueBuildingUpgradeOrder {
  export enum ErrorType {
    INVALID_LEVEL,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.INVALID_LEVEL]: "Invalid level",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  export function nextLevel(world: serverV1.World, villageCoords: string, buildingId: string) {
    const village = world.villages[villageCoords]
    const orders = village.buildingUpgradeOrders.filter(o => o.buildingId == buildingId)
    const field = world.fields[villageCoords]
    return field.buildings[buildingId] + orders.length + 1
  }

  interface Request {
    villageCoords: string
    buildingId: string
    level: number
  }

  export function call(world: serverV1.World, mut: Mutator, req: Request) {
    const building = world.buildings[req.buildingId]
    if (req.level != nextLevel(world, req.villageCoords, req.buildingId)) return err(new Err(ErrorType.INVALID_LEVEL))
    if (req.level > building.cost.length) return err(new Err(ErrorType.INVALID_LEVEL))

    const cost = building.cost[req.level-1]
    const order = { level: req.level, buildingId: req.buildingId, timeLeft: cost.time } as serverV1.Village_BuildingUpgradeOrder

    mut.setVillageBuildingUpgradeOrders(req.villageCoords, orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
    mut.setFieldResources(req.villageCoords, r => sub(r!, cost))

    return ok(order)
  }
}

export namespace CancelBuildingUpgradeOrder {
  export enum ErrorType {
    VILLAGE_NOT_FOUND,
    NO_ORDERS,
    NOT_LATEST_LEVEL,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.VILLAGE_NOT_FOUND]: "Village not found",
      [ErrorType.NO_ORDERS]: "No orders",
      [ErrorType.NOT_LATEST_LEVEL]: "Not latest level",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  interface Request {
    villageCoords: string
    buildingId: string
    level: number
  }

  export function call(world: serverV1.World, mut: Mutator, req: Request) {
    const village = world.villages[req.villageCoords]
    if (village == undefined) return err(new Err(ErrorType.VILLAGE_NOT_FOUND))

    const orders = village.buildingUpgradeOrders.filter(o => o.buildingId == req.buildingId)
    if (orders.length == 0) return err(new Err(ErrorType.NO_ORDERS))

    const latestLevel = orders.reduce((acc, o) => Math.max(acc, o.level), -1)
    if (latestLevel != req.level) return err(new Err(ErrorType.NOT_LATEST_LEVEL))

    const cost = world.buildings[req.buildingId].cost[req.level-1]
    mut.setVillageBuildingUpgradeOrders(req.villageCoords, orders => orders.filter(o => !(o.buildingId == req.buildingId && o.level == req.level)))
    mut.setFieldResources(req.villageCoords, r => add(r, cost))

    return ok()
  }
}