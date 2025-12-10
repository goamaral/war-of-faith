import { ok, err } from "neverthrow"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { Mutator } from './mutator'
import { add, fieldCanAfford, sub } from "./helpers"
import { newVillage_BuildingUpgradeOrder } from "./config"

export namespace IssueBuildingUpgradeOrder {
  export enum ErrorType {
    FIELD_NOT_FOUND,
    INVALID_PLAYER,
    INVALID_LEVEL,
    NOT_ENOUGH_GOLD,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.FIELD_NOT_FOUND]: "Field not found",
      [ErrorType.INVALID_PLAYER]: "Invalid player",
      [ErrorType.INVALID_LEVEL]: "Invalid level",
      [ErrorType.NOT_ENOUGH_GOLD]: "Not enough gold",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  export function nextLevel(world: serverV1.World, coords: string, buildingId: string) {
    const village = world.villages[coords]
    const orders = village.buildingUpgradeOrders.filter(o => o.buildingId == buildingId)
    const field = world.fields[coords]
    return field.buildingLevels[buildingId] + orders.length + 1
  }

  interface Request {
    coords: string
    buildingId: string
    level: number
  }

  export function call(world: serverV1.World, mut: Mutator, playerId: string, req: Request) {
    const field = world.fields[req.coords]
    if (field == undefined) return err(new Err(ErrorType.FIELD_NOT_FOUND))
    if (field.playerId != playerId) return err(new Err(ErrorType.INVALID_PLAYER))

    const building = world.buildings[req.buildingId]
    if (req.level != nextLevel(world, req.coords, req.buildingId)) return err(new Err(ErrorType.INVALID_LEVEL))
    if (req.level > building.cost.length) return err(new Err(ErrorType.INVALID_LEVEL))

    const cost = building.cost[req.level-1]
    if (!fieldCanAfford(field, building.cost[req.level-1])) return err(new Err(ErrorType.NOT_ENOUGH_GOLD))

    const order = newVillage_BuildingUpgradeOrder({ level: req.level, buildingId: req.buildingId, timeLeft: cost.time })
    world = mut.setVillageBuildingUpgradeOrders(req.coords, orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
    world = mut.setFieldResources(req.coords, r => sub(r!, cost))

    return ok(order)
  }
}

export namespace CancelBuildingUpgradeOrder {
  export enum ErrorType {
    FIELD_NOT_FOUND,
    INVALID_PLAYER,
    VILLAGE_NOT_FOUND,
    NO_ORDERS,
    NOT_LATEST_LEVEL,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.FIELD_NOT_FOUND]: "Field not found",
      [ErrorType.INVALID_PLAYER]: "Invalid player",
      [ErrorType.VILLAGE_NOT_FOUND]: "Village not found",
      [ErrorType.NO_ORDERS]: "No orders",
      [ErrorType.NOT_LATEST_LEVEL]: "Not latest level",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  interface Request {
    coords: string
    buildingId: string
    level: number
  }

  export function call(world: serverV1.World, mut: Mutator, playerId: string, req: Request) {
    const field = world.fields[req.coords]
    if (field == undefined) return err(new Err(ErrorType.FIELD_NOT_FOUND))
    if (field.playerId != playerId) return err(new Err(ErrorType.INVALID_PLAYER))

    const village = world.villages[req.coords]
    if (village == undefined) return err(new Err(ErrorType.VILLAGE_NOT_FOUND))

    const orders = village.buildingUpgradeOrders.filter(o => o.buildingId == req.buildingId)
    if (orders.length == 0) return err(new Err(ErrorType.NO_ORDERS))

    const latestLevel = orders.reduce((acc, o) => Math.max(acc, o.level), -1)
    if (latestLevel != req.level) return err(new Err(ErrorType.NOT_LATEST_LEVEL))

    const cost = world.buildings[req.buildingId].cost[req.level-1]
    world = mut.setVillageBuildingUpgradeOrders(req.coords, orders => orders.filter(o => !(o.buildingId == req.buildingId && o.level == req.level)))
    world = mut.setFieldResources(req.coords, r => add(r, cost))

    return ok()
  }
}