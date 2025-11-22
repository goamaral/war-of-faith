import { ok, ResultAsync } from "neverthrow"
import { batch } from "solid-js"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import {
  store, setStore, persistStore,
  state_cancelMovementOrder,
} from "./store"
import { serverCli } from "./api"
import { IssueMovementOrder } from "./state_movement_orders"

// Movement orders
export async function issueMovementOrder(sourceCoords: string, targetCoords: string, troops: Record<string, number>, gold: number) {
  const id = crypto.randomUUID()
  const res = batch(() => {
    return IssueMovementOrder.call(
      store.world,
      {
        id,
        sourceCoords,
        targetCoords,
        troops, 
        gold,
        playerId: store.playerId,
      },
      {
        setFieldTroops: (coords, set) => setStore("world", "fields", coords, "troops", set),
        setFieldGold: (coords, set) => setStore("world", "fields", coords, "resources", "gold", set),
        setMovementOrders: (set) => setStore("world", "movementOrders", set),
      }
    )
  })
  if (res.isErr()) {
    alert(`Failed to issue movement order (id: ${id}, sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${res.error}`)
    return
  }

  // const result = await ResultAsync.fromPromise(serverCli.issueMovementOrder({ id, sourceCoords, targetCoords, troops }), error => error)
  // if (result.isErr()) {
  //   alert(`Failed to issue movement order (id: ${id}, sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${result.error}`)
  //   state_cancelMovementOrder(id)
  //   return
  // }

  persistStore()

  return ok()
}

export async function cancelMovementOrder(order: serverV1.MovementOrder) {
  state_cancelMovementOrder(order.id)
  // serverCli.cancelMovementOrder({ id: order.id })
  //   .catch(err => {
  //     alert(`Failed to cancel movement order (id: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${err}`)
  //     state_issueMovementOrder(order.id, order.sourceCoords, order.targetCoords, order.troops)
  //   })
}
