import { ok, ResultAsync } from "neverthrow"
import { batch } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { IssueMovementOrder, CancelMovementOrder } from "../state/movement_orders"
import { store, persistStore, mutator } from "../store"
import { serverCli } from "../api"

// Movement orders
export async function issueMovementOrder(sourceCoords: string, targetCoords: string, troops: Record<string, number>, gold: number) {
  const id = crypto.randomUUID()
  const resIssueMovementOrder = batch(() => IssueMovementOrder.call(store.world, mutator, {
    id,
    sourceCoords,
    targetCoords,
    troops, 
    gold,
    playerId: store.playerId,
  }))
  if (resIssueMovementOrder.isErr()) {
    alert(`Failed to issue movement order (sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${resIssueMovementOrder.error}`)
    return
  }

  // const resServerIssueMovementOrder = await ResultAsync.fromPromise(serverCli.issueMovementOrder({ id, sourceCoords, targetCoords, troops }), err => err)
  // if (resServerIssueMovementOrder.isErr()) {
  //   alert(`Failed to issue movement order (id: ${id}, sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${resServerIssueMovementOrder.error}`)
  //   batch(() => CancelMovementOrder.call(store.world, mutator, id))
  //   return
  // }

  persistStore()
  return ok()
}

export async function cancelMovementOrder(order: serverV1.MovementOrder) {
  const resCancelMovementOrder = batch(() => CancelMovementOrder.call(store.world, mutator, order.id))
  if (resCancelMovementOrder.isErr()) {
    alert(`Failed to cancel movement order (id: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${resCancelMovementOrder.error}`)
    return
  }
  
  // const resServerCancelMovementOrder = await ResultAsync.fromPromise(serverCli.cancelMovementOrder({ id: order.id }), err => err)
  // if (resServerCancelMovementOrder.isErr()) {
  //   alert(`Failed to cancel movement order (id: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${resServerCancelMovementOrder.error}`)
  //   batch(() => IssueMovementOrder.call(store.world, mutator, {
  //     id: order.id,
  //     sourceCoords: order.sourceCoords,
  //     targetCoords: order.targetCoords,
  //     troops: order.troops,
  //     gold: order.resources!.gold,
  //     playerId: order.playerId,
  //   }))
  //   return
  // }

  persistStore()
  return ok()
}
