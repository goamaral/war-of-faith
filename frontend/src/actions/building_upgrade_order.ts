import { ResultAsync } from "neverthrow"
import { batch } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { IssueBuildingUpgradeOrder, CancelBuildingUpgradeOrder } from "../state/building_upgrade_order"
import { serverCli } from "../api"
import { mutator, store } from "../store"

export async function issueBuildingUpgradeOrder(coords: string, buildingId: string, level: number) {
  const resIssueBuildingUpgradeOrder = batch(() => IssueBuildingUpgradeOrder.call(store.world, mutator, store.playerId, { coords, buildingId, level }))
  if (resIssueBuildingUpgradeOrder.isErr()) {
    alert(`Failed to issue building upgrade order (buildingId: ${buildingId}, level: ${level}): ${resIssueBuildingUpgradeOrder.error}`)
    return
  }

  // const resServerIssueBuildingUpgradeOrder = await ResultAsync.fromPromise(serverCli.issueBuildingUpgradeOrder({ coords, buildingId, level }), err => err)
  // if (resServerIssueBuildingUpgradeOrder.isErr()) {
  //   alert(`Failed to issue building upgrade order (buildingId: ${buildingId}, level: ${level}): ${resServerIssueBuildingUpgradeOrder.error}`)
  //   batch(() => CancelBuildingUpgradeOrder.call(store.world, mutator, store.playerId, { coords, buildingId, level }))
  //   return
  // }
}

export async function cancelBuildingUpgradeOrder(coords: string, buildingId: string, level: number) {
  const resCancelBuildingUpgradeOrder = batch(() => CancelBuildingUpgradeOrder.call(store.world, mutator, store.playerId, { coords, buildingId, level }))
  if (resCancelBuildingUpgradeOrder.isErr()) {
    alert(`Failed to cancel building upgrade order (buildingId: ${buildingId}, level: ${level}): ${resCancelBuildingUpgradeOrder.error}`)
    return
  }

  // const resServerCancelBuildingUpgradeOrder = await ResultAsync.fromPromise(serverCli.cancelBuildingUpgradeOrder({ coords, buildingId, level }), err => err)
  // if (resServerCancelBuildingUpgradeOrder.isErr()) {
  //   alert(`Failed to cancel building upgrade order (buildingId: ${buildingId}, level: ${level}): ${resServerCancelBuildingUpgradeOrder.error}`)
  //   batch(() => IssueBuildingUpgradeOrder.call(store.world, mutator, store.playerId, { coords, buildingId, level }))
  //   return
  // }
}