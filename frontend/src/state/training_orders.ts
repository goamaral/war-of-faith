import { ok, err } from "neverthrow"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { Mutator } from "./mutator"
import { add, div, fieldCanAfford, mulN, playerVillageFields, sub } from "./helpers"
import { LEADER, TROOP_IDS } from "./config"

export namespace IssueTrainingOrder {
  export enum ErrorType {
    FIELD_NOT_FOUND,
    INVALID_PLAYER,
    NOT_ENOUGH_GOLD,
    INVALID_QUANTITY,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.FIELD_NOT_FOUND]: "Field not found",
      [ErrorType.INVALID_PLAYER]: "Invalid player",
      [ErrorType.NOT_ENOUGH_GOLD]: "Not enough gold",
      [ErrorType.INVALID_QUANTITY]: "Invalid quantity",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  export function trainableLeaders(world: serverV1.World, playerId: string) {
    const maxLeaders = playerVillageFields(world, playerId).length
    const leaders = playerVillageFields(world, playerId).reduce((acc, f) => acc + f.troops[LEADER], 0)
    const leadersInTraining = playerVillageFields(world, playerId)
      .map(f => world.villages[f.coords].trainingOrders)
      .flat()
      .filter(o => o.troopId == LEADER)
      .reduce((acc, o) => acc + o.quantity, 0)
    return maxLeaders - leaders - leadersInTraining
  }

  export function trainableTroops(world: serverV1.World, playerId: string, villageCoords: string, troopQuantityPlan: Record<string, number>) {
    let resourcesLeft = world.fields[villageCoords].resources!
    for (const troopId of TROOP_IDS) {
      resourcesLeft = sub(resourcesLeft, mulN(world.troops[troopId].cost!, troopQuantityPlan[troopId]))
    }

    const res: Record<string, number> = {}
    for (const troopId of TROOP_IDS) {
      const troop = world.troops[troopId]
      const troopQuantityCost = mulN(troop.cost!, troopQuantityPlan[troopId])
      res[troopId] = Math.floor(div(add(resourcesLeft, troopQuantityCost), troop.cost!, k => k != "time"))
      if (troopId == LEADER) res[troopId] = Math.min(res[troopId], trainableLeaders(world, playerId))
    }

    return res
  }

  interface Request {
    orderId: string
    coords: string
    troopId: string
    quantity: number
  }

  export function call(world: serverV1.World, mut: Mutator, playerId: string, req: Request) {
    const field = world.fields[req.coords]
    if (field == undefined) return err(new Err(ErrorType.FIELD_NOT_FOUND))
    if (field.playerId != playerId) return err(new Err(ErrorType.INVALID_PLAYER))
      
    const troop = world.troops[req.troopId]
    const cost = mulN(troop.cost!, req.quantity) as serverV1.Resources
    if (!fieldCanAfford(field, cost)) return err(new Err(ErrorType.NOT_ENOUGH_GOLD))

    const maxQuantity = trainableTroops(world, playerId, req.coords, { [req.troopId]: req.quantity })[req.troopId]
    if (req.quantity > maxQuantity) return err(new Err(ErrorType.INVALID_QUANTITY))

    const order = { id: req.orderId, quantity: req.quantity, troopId: req.troopId, timeLeft: cost.time } as serverV1.Village_TrainingOrder
    world = mut.setVillageTrainingOrders(req.coords, orders => [...orders, order])
    world = mut.setFieldResources(req.coords, r => sub(r!, cost))

    return ok(order)
  }
}

export namespace CancelTrainingOrder {
  export enum ErrorType {
    FIELD_NOT_FOUND,
    INVALID_PLAYER,
    VILLAGE_NOT_FOUND,
    ORDER_NOT_FOUND,
    NOT_ENOUGH_GOLD,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.FIELD_NOT_FOUND]: "Field not found",
      [ErrorType.INVALID_PLAYER]: "Invalid player",
      [ErrorType.VILLAGE_NOT_FOUND]: "Village not found",
      [ErrorType.ORDER_NOT_FOUND]: "Order not found",
      [ErrorType.NOT_ENOUGH_GOLD]: "Not enough gold",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  export function call(world: serverV1.World, mut: Mutator, playerId: string, coords: string, orderId: string) {
    const field = world.fields[coords]
    if (field == undefined) return err(new Err(ErrorType.FIELD_NOT_FOUND))
    if (field.playerId != playerId) return err(new Err(ErrorType.INVALID_PLAYER))

    const village = world.villages[coords]
    if (village == undefined) return err(new Err(ErrorType.VILLAGE_NOT_FOUND))

    const order = village.trainingOrders.find(o => o.id == orderId)
    if (order == undefined) return err(new Err(ErrorType.ORDER_NOT_FOUND))

    const troop = world.troops[order.troopId]
    const cost = mulN(troop.cost!, order.quantity)

    world = mut.setVillageTrainingOrders(coords, orders => orders.filter(o => !(o.id == orderId)))
    world = mut.setFieldResources(coords, r => add(r!, cost))

    return ok()
  }
}
