import type { JSX, FlowComponent } from "solid-js"

import { createStore, SetStoreFunction } from "solid-js/store"
import { batch, createUniqueId, onCleanup, onMount, Show } from "solid-js"
import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import { serverCli } from './api'

export const playerId = "1"

export const [store, setStore] = createStore({
  loaded: false,
  world: {} as serverV1.World
})

// Persistence
function persistStore() {
  localStorage.setItem("store", JSON.stringify(store))
}
async function loadStore() {
  const persistedStore = localStorage.getItem("store")
  if (persistedStore) {
    const store = JSON.parse(persistedStore)
    setStore(store)

  } else {
    const { world } = await serverCli.getWorld({})
    const store = { loaded: true, world }
    setStore(store)
    localStorage.setItem("store", JSON.stringify(store))
  }
}

// Helpers
export const playerVillages = () => Object.values(store.world.villages).filter(v => v!.playerId == playerId)

export function StoreLoader({ children }: { children: () => JSX.Element }) {
  onMount(async () => {
    if (store.loaded) return

    // async function subscribeToWorld() {
    //   try {
    //     for await (const { patch } of serverCli.subscribeToWorld({})) {
    //       applyWorldPatch(patch!)
    //     }
    //   } catch (err) {
    //     alert(`Failed to subscribe to world: ${err}`)
    //     subscribeToWorld()
    //   }
    // }
    // subscribeToWorld()

    const intervalId = setInterval(state_tick, 1000)
    onCleanup(() => clearInterval(intervalId))

    await loadStore()
  })

  return <Show when={store.loaded} fallback={<p>Loading...</p>} keyed>
    {(_) => children()}
  </Show>
}

//   applyWorldPatch(patch: serverV1.SubscribeToWorldResponse_Patch) {
//     const { world } = get()
//     world.fields = patch.fields

//     set(() => ({
//       world,
//       villages: Object.fromEntries(Object.entries(patch.villages).map(([k, v]) => [k, new entities.Village(v)])),
//       // temples
//       attacks: patch.attacks,
//     }))

// Troop movement orders
export async function issueTroopMovementOrder(sourceCoords: string, targetCoords: string, troops: Record<string, number>) {
  const id = crypto.randomUUID()
  state_issueTroopMovementOrder(id, sourceCoords, targetCoords, troops)
  // serverCli.issueTroopMovementOrder({ id, sourceCoords, targetCoords, troops })
  //   .catch(err => {
  //     alert(`Failed to issue troop movement order (id: ${id}, sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${err}`)
  //     state_cancelTroopMovementOrder(id)
  //   })
}
export async function cancelTroopMovementOrder(order: serverV1.TroopMovementOrder) {
  state_cancelTroopMovementOrder(order.id)
  // serverCli.cancelTroopMovementOrder({ id: order.id })
  //   .catch(err => {
  //     alert(`Failed to cancel troop movement order (id: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${err}`)
  //     state_issueTroopMovementOrder(order.id, order.sourceCoords, order.targetCoords, order.troops)
  //   })
}

// Building upgrade orders
export function issueBuildingUpgradeOrder(villageCoords: string, buildingId: string, level: number) {
  const order = state_issueBuildingUpgradeOrder(villageCoords, buildingId, level)
  // serverCli.issueBuildingUpgradeOrder({ villageCoords, buildingId: buildingId, level: level })
  //   .catch(err => {
  //     alert(`Failed to issue building upgrade order (buildingId: ${buildingId}, level: ${level}): ${err}`)
  //     state_cancelBuildingUpgradeOrder(villageCoords, order)
  //   })
}
export async function cancelBuildingUpgradeOrder(villageCoords: string, order: serverV1.Village_BuildingUpgradeOrder) {
  state_cancelBuildingUpgradeOrder(villageCoords, order)
  // serverCli.cancelBuildingUpgradeOrder({ villageCoords, buildingId: order.buildingId, level: order.level })
  //   .catch(err => {
  //     alert(`Failed to cancel building upgrade order (buildingId: ${order.buildingId}, level: ${order.level}): ${err}`)
  //     state_issueBuildingUpgradeOrder(villageCoords, order.buildingId, order.level)
  //   })
}

// Troop training orders
export function issueTroopTrainingOrder(villageCoords: string, troopId: string, quantity: number) {
  const order = state_issueTroopTrainingOrder(villageCoords, troopId, quantity)
  // serverCli.issueTroopTrainingOrder({ villageCoords, troopId: troopId, quantity: quantity })
  //   .catch(err => {
  //     alert(`Failed to issue troop training order (troopId: ${troopId}, quantity: ${quantity}): ${err}`)
  //     state_cancelTroopTrainingOrder(villageCoords, order)
  //   })
}
export async function cancelTroopTrainingOrder(villageCoords: string, order: serverV1.Village_TroopTrainingOrder) {
  state_cancelTroopTrainingOrder(villageCoords, order)
  // serverCli.cancelTroopTrainingOrder({ villageCoords, troopId: order.troopId, quantity: order.quantity })
  //   .catch(err => {
  //     alert(`Failed to cancel troop training order (troopId: ${order.troopId}, quantity: ${order.quantity}): ${err}`)
  //     state_issueTroopTrainingOrder(villageCoords, order.troopId, order.quantity)
  //   })
}

// Resources
export function addResources(a: serverV1.Resources, b: serverV1.Resources) {
  return {
    gold: a.gold + b.gold,
    time: a.time + b.time,
  } as serverV1.Resources
}
export function subResources(a: serverV1.Resources, b: serverV1.Resources) {
  return {
    gold: a.gold - b.gold,
    time: a.time - b.time,
  } as serverV1.Resources
}
export function mulResources(a: serverV1.Resources, n: number) {
  return {
    gold: a.gold * n,
    time: a.time * n,
  } as serverV1.Resources
}

/* State machine */
function state_tick() {
  batch(() => {
    // Move troops
    const newTroopMovementOrders: serverV1.TroopMovementOrder[] = []
    store.world.troopMovementOrders.forEach(order => {
      const timeLeft = order.timeLeft - 1
      if (timeLeft == 0) {
        // TODO: Combat
      } else {
        newTroopMovementOrders.push({ ...order, timeLeft })
      }
    })
    setStore("world", "troopMovementOrders", newTroopMovementOrders)

    Object.entries(store.world.villages).forEach(([villageCoords, village]) => {
      // Increase resources
      setStore("world", "villages", villageCoords, "resources", r => ({ gold: r!.gold + 1 }))

      // Upgrade buildings
      const newBuildingUpgradeOrders: serverV1.Village_BuildingUpgradeOrder[] = []
      village.buildingUpgradeOrders.forEach(order => {
        const timeLeft = order.timeLeft - 1
        if (timeLeft == 0) {
          setStore("world", "villages", villageCoords, "buildings", order.buildingId, b => b + 1)
        } else {
          newBuildingUpgradeOrders.push({ ...order, timeLeft })
        }
      })
      setStore("world", "villages", villageCoords, "buildingUpgradeOrders", newBuildingUpgradeOrders)

      // Train troops
      const newTroopTrainingOrders: serverV1.Village_TroopTrainingOrder[] = []
      village.troopTrainingOrders.forEach((order, index) => {
        const timeLeft = order.timeLeft - 1
        if (timeLeft == 0) {
          setStore("world", "villages", villageCoords, "troops", order.troopId, t => t + 1)
        } else {
          newTroopTrainingOrders.push({ ...order, timeLeft })
        }
      })
      setStore("world", "villages", villageCoords, "troopTrainingOrders", newTroopTrainingOrders)
    })
  })
  persistStore()
}

// Troop movement orders
function state_issueTroopMovementOrder(id: string, sourceCoords: string, targetCoords: string, troops: Record<string, number>) {
  const timeCost = 10 // TODO: Dynamic time cost based on distance
  const order = { id, sourceCoords, targetCoords, troops, timeLeft: timeCost } as serverV1.TroopMovementOrder
  batch(() => {
    // TODO: Remove troops from source village
    setStore("world", "troopMovementOrders", orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
  })
  persistStore()
}
function state_cancelTroopMovementOrder(id: string) {
  batch(() => {
    // TODO: Comeback
    setStore("world", "troopMovementOrders", orders => orders.filter(o => o.id !== id))
  })
  persistStore()
}

// Building upgrade orders
function state_issueBuildingUpgradeOrder(villageCoords: string, buildingId: string, level: number) {
  const building = store.world.buildings[buildingId]
  const cost = building.cost[level-1]
  const order = { level, buildingId, timeLeft: cost.time } as serverV1.Village_BuildingUpgradeOrder
  batch(() => {
    setStore("world", "villages", villageCoords, "buildingUpgradeOrders", orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
    state_subResources(villageCoords, cost)
  })
  persistStore()
  return order
}
function state_cancelBuildingUpgradeOrder(villageCoords: string, order: serverV1.Village_BuildingUpgradeOrder) {
  const building = store.world.buildings[order.buildingId]
  const cost = building.cost[order.level-1]
  batch(() => {
    setStore("world", "villages", villageCoords, "buildingUpgradeOrders", orders => orders.filter(o => !(o.buildingId == order.buildingId && o.level == order.level)))
    state_addResources(villageCoords, cost)
  })
  persistStore()
}

// Troop training orders
function state_issueTroopTrainingOrder(villageCoords: string, troopId: string, quantity: number) {
  const troop = store.world.troops[troopId]
  const cost = mulResources(troop.cost!, quantity)
  const order = { quantity, troopId, timeLeft: cost.time } as serverV1.Village_TroopTrainingOrder
  batch(() => {
    setStore("world", "villages", villageCoords, "troopTrainingOrders", orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
    state_subResources(villageCoords, cost)
  })
  persistStore()
  return order
}
function state_cancelTroopTrainingOrder(villageCoords: string, order: serverV1.Village_TroopTrainingOrder) {
  const troop = store.world.troops[order.troopId]
  const cost = mulResources(troop.cost!, order.quantity)
  batch(() => {
    setStore("world", "villages", villageCoords, "troopTrainingOrders", orders => orders.filter(o => !(o.troopId == order.troopId && o.quantity == order.quantity)))
    state_addResources(villageCoords, cost)
  })
  persistStore()
}

// Resources
function state_addResources(villageCoords: string, resources: serverV1.Resources) {
  setStore("world", "villages", villageCoords, "resources", r => addResources(r!, resources))
}
function state_subResources(villageCoords: string, resources: serverV1.Resources) {
  setStore("world", "villages", villageCoords, "resources", r => subResources(r!, resources))
}