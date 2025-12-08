import { ResultAsync } from "neverthrow"
import { batch } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { serverCli } from "../api"
import { store, mutator } from "../store"
import { IssueTrainingOrder, CancelTrainingOrder } from "../state/training_orders"

export async function issueTrainingOrder(coords: string, troopId: string, quantity: number) {
  const orderId = crypto.randomUUID()
  const resIssueTrainingOrder = batch(() => IssueTrainingOrder.call(store.world, mutator,  store.playerId, {
    orderId,
    coords,
    troopId,
    quantity,
  }))
  if (resIssueTrainingOrder.isErr()) {
    alert(`Failed to issue training order (troopId: ${troopId}, quantity: ${quantity}): ${resIssueTrainingOrder.error}`)
    return
  }

  // const resServerIssueTrainingOrder = await ResultAsync.fromPromise(serverCli.issueTrainingOrder({ coords, troopId: troopId, quantity: quantity }), err => err)
  // if (resServerIssueTrainingOrder.isErr()) {
  //   alert(`Failed to issue troop training order (troopId: ${troopId}, quantity: ${quantity}): ${resServerIssueTrainingOrder.error}`)
  //   batch(() => CancelTrainingOrder.call(store.world, mutator, store.playerId, coords, orderId))
  //   return
  // }
}

export async function cancelTrainingOrder(coords: string, order: serverV1.Village_TrainingOrder) {
  const resCancelTrainingOrder = batch(() => CancelTrainingOrder.call(store.world, mutator, store.playerId, coords, order.id))
  if (resCancelTrainingOrder.isErr()) {
    alert(`Failed to cancel training order (coords: ${coords}, orderId: ${order.id}): ${resCancelTrainingOrder.error}`)
    return
  }

  // const resServerIssueTrainingOrder = await ResultAsync.fromPromise(serverCli.cancelTrainingOrder({ coords, orderId: order.id }), err => err)
  // if (resServerIssueTrainingOrder.isErr()) {
  //   alert(`Failed to cancel training order (coords: ${coords}, orderId: ${order.id}): ${resServerIssueTrainingOrder.error}`)
  //   batch(() => IssueTrainingOrder.call(store.world, mutator, store.playerId, { ...order, coords, orderId: order.id }))
  //   return
  // }
}