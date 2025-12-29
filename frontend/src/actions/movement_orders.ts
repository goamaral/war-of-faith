import { ResultAsync } from "neverthrow"
import { batch } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { IssueMovementOrder, CancelMovementOrder } from "../state/movement_orders"
import { serverCli } from "../api"
import { store, mutator } from "../store"

// Movement orders
export async function issueMovementOrder(sourceCoords: string, targetCoords: string, troops: Record<string, number>, gold: number) {
  const orderId = crypto.randomUUID()
  const resIssueMovementOrder = batch(() => IssueMovementOrder.call(store.world, mutator, store.playerId, {
    orderId,
    sourceCoords,
    targetCoords,
    troops, 
    gold,
  }))
  if (resIssueMovementOrder.isErr()) {
    alert(`[STATE] Failed to issue movement order (sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${resIssueMovementOrder.error}`)
    return
  }

  const resServerIssueMovementOrder = await ResultAsync.fromPromise(serverCli.issueMovementOrder({ orderId, sourceCoords, targetCoords, troops }), err => err)
  if (resServerIssueMovementOrder.isErr()) {
    alert(`[SERVER] Failed to issue movement order (orderId: ${orderId}, sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${resServerIssueMovementOrder.error}`)
    batch(() => CancelMovementOrder.call(store.world, mutator, store.playerId, orderId))
    return
  }
}

export async function cancelMovementOrder(order: serverV1.MovementOrder) {
  const resCancelMovementOrder = batch(() => CancelMovementOrder.call(store.world, mutator, store.playerId, order.id))
  if (resCancelMovementOrder.isErr()) {
    alert(`[STATE] Failed to cancel movement order (id: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${resCancelMovementOrder.error}`)
    return
  }
  
  const resServerCancelMovementOrder = await ResultAsync.fromPromise(serverCli.cancelMovementOrder({ orderId: order.id }), err => err)
  if (resServerCancelMovementOrder.isErr()) {
    alert(`[SERVER] Failed to cancel movement order (orderId: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${resServerCancelMovementOrder.error}`)
    batch(() => IssueMovementOrder.call(store.world, mutator, store.playerId, {
      orderId: order.id,
      sourceCoords: order.sourceCoords,
      targetCoords: order.targetCoords,
      troops: order.troops,
      gold: order.resources!.gold,
    }))
    return
  }
}
