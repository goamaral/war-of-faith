import { ok, err } from "neverthrow"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { calcDist, countTroops, sub } from '../helpers'
import { newResources } from "../entities"
import { movementLogger } from "../logger"
import { Mutator } from "./mutator"

export const CARRIABLE_GOLD_PER_UNIT = 10

export namespace IssueMovementOrder {
  export enum ErrorType {
    INVALID_TROOP_QUANTITY,
    INVALID_GOLD,
    INVALID_PLAYER,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.INVALID_TROOP_QUANTITY]: "Invalid troop quantity",
      [ErrorType.INVALID_GOLD]: "Invalid gold",
      [ErrorType.INVALID_PLAYER]: "Invalid player",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  export function maxTroopQuantity(world: serverV1.World, coords: string, troopId: string) {
    return world.fields[coords].troops[troopId] || 0
  }

  export function maxGold(world: serverV1.World, coords: string, troopQuantity: Record<string, number> = {}) {
    return Math.min(world.fields[coords].resources!.gold, countTroops(troopQuantity) * CARRIABLE_GOLD_PER_UNIT)
  }

  interface Request {
    id: string
    sourceCoords: string
    targetCoords: string
    troops: Record<string, number>
    gold: number
    playerId: string
  }

  export function call(world: serverV1.World, mut: Mutator, req: Request) {
    // Troops validation
    for (const troopId in req.troops) {
      const quantity = req.troops[troopId]
      if (quantity < 0) return err(new Err(ErrorType.INVALID_TROOP_QUANTITY))
      if (quantity > maxTroopQuantity(world, req.sourceCoords, troopId)) return err(new Err(ErrorType.INVALID_TROOP_QUANTITY))
    }

    // Resources validation
    if (req.gold < 0) return err(new Err(ErrorType.INVALID_GOLD))
    if (req.gold > maxGold(world, req.sourceCoords)) return err(new Err(ErrorType.INVALID_GOLD))

    // Player validation
    if (req.playerId != world.fields[req.sourceCoords].playerId) return err(new Err(ErrorType.INVALID_PLAYER))

    // Apply
    const order = {
      id: req.id,
      sourceCoords: req.sourceCoords,
      targetCoords: req.targetCoords,
      troops: req.troops,
      resources: newResources({ gold: req.gold }),
      timeLeft: calcDist(req.sourceCoords, req.targetCoords),
      playerId: req.playerId,
    } as serverV1.MovementOrder

    mut.setFieldTroops(req.sourceCoords, troops => sub(troops, req.troops))
    mut.setFieldGold(req.sourceCoords, gold => gold - req.gold)
    mut.setMovementOrders(orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))

    movementLogger(`Issued movement order (id: ${req.id}, source: ${req.sourceCoords}, target: ${req.targetCoords})`)
    return ok()
  }
}

export namespace CancelMovementOrder {
  export enum ErrorType {
    MOVEMENT_ORDER_NOT_FOUND,
    MOVEMENT_ORDER_COMING_BACK,
  }
  export class Err extends Error {
    static typeToMsg: Record<ErrorType, string> = {
      [ErrorType.MOVEMENT_ORDER_NOT_FOUND]: "Movement order not found",
      [ErrorType.MOVEMENT_ORDER_COMING_BACK]: "Movement order coming back",
    }

    constructor(public type: ErrorType) {
      super(Err.typeToMsg[type] || `Error(type: ${type})`)
    }
  }

  export function call(world: serverV1.World, mut: Mutator, id: string) {
    const index = world.movementOrders.findIndex(o => o.id == id)
    if (index == -1) return err(new Err(ErrorType.MOVEMENT_ORDER_NOT_FOUND))

    const order = world.movementOrders[index]
    if (order.comeback) return err(new Err(ErrorType.MOVEMENT_ORDER_NOT_FOUND))

    mut.setMovementOrders(orders => {
      orders[index] = {
        ...order,
        timeLeft: calcDist(order.sourceCoords, order.targetCoords) - order.timeLeft,
        comeback: true,
      }
      return orders.slice().sort((a, b) => a.timeLeft - b.timeLeft)
    })

    movementLogger(`Canceled movement order (id: ${order.id}, source: ${order.sourceCoords}, target: ${order.targetCoords})`)
    return ok()
  }
}
