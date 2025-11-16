import type { JSX, FlowComponent } from "solid-js"

import { createStore } from "solid-js/store"
import { batch, onCleanup, onMount, Show } from "solid-js"
import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import { serverCli } from './api'
import { newVillage, newWildField, newResources, HALL, LEADER, GOLD_MINE, carriableGoldPerUnit, countTroops, newFieldTroops, RAIDER } from './entities'
import { combatLogger } from "./logger"

export const playerId = "1"

export const [store, setStore] = createStore({
  loaded: false,
  world: {} as serverV1.World
})

declare global {
  interface Window {
    resetStore: () => void
  }
}
window.resetStore = function() {
  localStorage.removeItem("store")
  setStore("loaded", false)
  location.reload()
}

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
    for (let x = 0; x < world!.width; x++) {
      for (let y = 0; y < world!.height; y++) {
        const coords = encodeCoords(x, y)
        if (world!.fields[coords] == undefined) {
          world!.fields[coords] = newWildField(coords, {}, Object.keys(world!.buildings))
        }
      }
    }
    const store = { loaded: true, world }
    setStore(store)
    localStorage.setItem("store", JSON.stringify(store))
  }
}

// Helpers
export function playerFields(filter?: (f: serverV1.World_Field) => boolean) {
  return Object.values(store.world.fields).filter(f => f?.playerId == playerId && (!filter || filter(f)))
}
export function playerVillageFields(filter?: (f: serverV1.World_Field) => boolean) {
  return playerFields(filter).filter(f => f.kind == serverV1.World_Field_Kind.VILLAGE)
}

export function StoreLoader({ children }: { children: () => JSX.Element }) {
  onMount(() => {
    let intervalId = undefined as undefined | number
    
    async function setup() {
      if (!store.loaded) await loadStore()

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

      intervalId = setInterval(state_tick, 1000)
    }
  
    setup()
    onCleanup(() => clearInterval(intervalId))
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

// Movement orders
export async function issueMovementOrder(sourceCoords: string, targetCoords: string, troops: Record<string, number>, gold: number) {
  const id = crypto.randomUUID()
  state_issueMovementOrder(id, sourceCoords, targetCoords, troops, gold)
  // serverCli.issueMovementOrder({ id, sourceCoords, targetCoords, troops })
  //   .catch(err => {
  //     alert(`Failed to issue movement order (id: ${id}, sourceCoords: ${sourceCoords}, targetCoords: ${targetCoords}): ${err}`)
  //     state_cancelMovementOrder(id)
  //   })
}
export async function cancelMovementOrder(order: serverV1.MovementOrder) {
  state_cancelMovementOrder(order.id)
  // serverCli.cancelMovementOrder({ id: order.id })
  //   .catch(err => {
  //     alert(`Failed to cancel movement order (id: ${order.id}, sourceCoords: ${order.sourceCoords}, targetCoords: ${order.targetCoords}): ${err}`)
  //     state_issueMovementOrder(order.id, order.sourceCoords, order.targetCoords, order.troops)
  //   })
}

// Building upgrade orders
export function issueBuildingUpgradeOrder(coords: string, buildingId: string, level: number) {
  const order = state_issueBuildingUpgradeOrder(coords, buildingId, level)
  // serverCli.issueBuildingUpgradeOrder({ coords, buildingId: buildingId, level: level })
  //   .catch(err => {
  //     alert(`Failed to issue building upgrade order (buildingId: ${buildingId}, level: ${level}): ${err}`)
  //     state_cancelBuildingUpgradeOrder(coords, order)
  //   })
}
export async function cancelBuildingUpgradeOrder(coords: string, order: serverV1.Village_BuildingUpgradeOrder) {
  state_cancelBuildingUpgradeOrder(coords, order)
  // serverCli.cancelBuildingUpgradeOrder({ coords, buildingId: order.buildingId, level: order.level })
  //   .catch(err => {
  //     alert(`Failed to cancel building upgrade order (buildingId: ${order.buildingId}, level: ${order.level}): ${err}`)
  //     state_issueBuildingUpgradeOrder(coords, order.buildingId, order.level)
  //   })
}

// Troop training orders
export function issueTroopTrainingOrder(coords: string, troopId: string, quantity: number) {
  const order = state_issueTroopTrainingOrder(coords, troopId, quantity)
  // serverCli.issueTroopTrainingOrder({ coords, troopId: troopId, quantity: quantity })
  //   .catch(err => {
  //     alert(`Failed to issue troop training order (troopId: ${troopId}, quantity: ${quantity}): ${err}`)
  //     state_cancelTroopTrainingOrder(coords, order)
  //   })
}
export async function cancelTroopTrainingOrder(coords: string, order: serverV1.Village_TroopTrainingOrder) {
  state_cancelTroopTrainingOrder(coords, order)
  // serverCli.cancelTroopTrainingOrder({ coords, troopId: order.troopId, quantity: order.quantity })
  //   .catch(err => {
  //     alert(`Failed to cancel troop training order (troopId: ${order.troopId}, quantity: ${order.quantity}): ${err}`)
  //     state_issueTroopTrainingOrder(coords, order.troopId, order.quantity)
  //   })
}

// Helpers
export function add<T extends Record<string, any>>(a: T, b: T): T {
  const res = { ...a } as Record<string, any>
  for (const [k, v] of Object.entries(b)) {
    res[k] = typeof v == "number" ? res[k] + v : v
  }
  return res as T
}
export function sub<T extends Record<string, any>>(a: T, b: T): T {
  const res = { ...a } as Record<string, any>
  for (const [k, v] of Object.entries(b)) {
    res[k] = typeof v == "number" ? res[k] - v : v
  }
  return res as T
}
export function mulN<T extends Record<string, any>>(a: T, n: number): T {
  const res = {} as Record<string, any>
  for (const [k, v] of Object.entries(a)) {
    res[k] = typeof v == "number" ? v * n : v
  }
  return res as T
}
export function div<T extends Record<string, any>>(a: T, b: T, filter?: (k: string) => boolean): number {
  let res = Infinity
  for (const [k, v] of Object.entries(a)) {
    if (typeof v != "number") continue
    if (filter && !filter(k)) continue
    res = Math.min(res, v / b[k])
  }
  return res
}
export function divN<T extends Record<string, any>>(a: T, n: number): T {
  const res = {} as Record<string, any>
  for (const [k, v] of Object.entries(a)) {
    res[k] = typeof v == "number" ? v / n : v
  }
  return res as T
}
export function decodeCoords(coords: string) {
  const [x, y] = coords.split('_').map(Number)
  return { x, y }
}
export function encodeCoords(x: number, y: number) {
  return `${x}_${y}`
}
function calculateDistance(sourceCoords: string, targetCoords: string) {
  const { x: srcX, y: srcY } = decodeCoords(sourceCoords)
  const { x: trgX, y: trgY } = decodeCoords(targetCoords)
  return Math.abs(srcX - trgX) + Math.abs(srcY - trgY)
}

/* State machine */
function state_tick() {
  batch(() => {
    // Move orders
    const newMovementOrders: serverV1.MovementOrder[] = []
    store.world.movementOrders.forEach(order => {
      const targetCoords = order.comeback ? order.sourceCoords : order.targetCoords
      const timeLeft = order.timeLeft - 1
      if (timeLeft == 0) {
        const targetField = store.world.fields[targetCoords]
        if (targetField.playerId != order.playerId) {
          // Combat
          const attackerTroops = newFieldTroops(order.troops)
          const defenderTroops = newFieldTroops(targetField.troops)
          const getTroopLayer = (troops: Record<string, number>) => {
            if (troops[RAIDER] > 0) return { troopId: RAIDER, quantity: troops[RAIDER] }
            if (troops[LEADER] > 0) return { troopId: LEADER, quantity: troops[LEADER] }
            return { troopId: undefined, quantity: 0 }
          }
          while (true) {
            const { troopId: attackerTroopId, quantity: attackerQuantity } = getTroopLayer(attackerTroops)
            if (attackerTroopId == undefined) {
              combatLogger("Attacker lost")
              break
            }
            const { troopId: defenderTroopId, quantity: defenderQuantity } = getTroopLayer(defenderTroops)
            if (defenderTroopId == undefined) {
              combatLogger("Defender lost")
              break
            }

            combatLogger(`${attackerQuantity} ${attackerTroopId} VS ${defenderQuantity} ${defenderTroopId}`)

            attackerTroops[attackerTroopId] = Math.max(0, attackerTroops[attackerTroopId] - defenderQuantity)
            defenderTroops[defenderTroopId] = Math.max(0, defenderTroops[defenderTroopId] - attackerQuantity)
          }

          const troopsLeft = countTroops(attackerTroops)
          if (troopsLeft > 0) {
            // Conquer
            if (attackerTroops[LEADER] > 0) {
              if (targetField.kind != serverV1.World_Field_Kind.TEMPLE) {
                setStore("world", "fields", targetCoords, f => ({
                  ...f,
                  kind: serverV1.World_Field_Kind.VILLAGE,
                  troops: attackerTroops,
                  resources: add(f.resources!, order.resources!),
                  playerId: order.playerId,
                } as serverV1.World_Field))
                setStore("world", "villages", targetCoords, newVillage())

              } else {
                setStore("world", "fields", targetCoords, f => ({
                  ...f,
                  troops: attackerTroops,
                  resources: add(f.resources!, order.resources!),
                  playerId: order.playerId,
                }) as serverV1.World_Field)
              }
              combatLogger(`Field ${targetCoords} conquered`)

            } else {
              // Pillage
              const pillage = { gold: Math.min(targetField.resources!.gold, troopsLeft * carriableGoldPerUnit) } as serverV1.Resources
              setStore("world", "fields", targetCoords, "resources", r => sub(r!, pillage))
              newMovementOrders.push({
                ...order,
                troops: attackerTroops,
                resources: pillage,
                timeLeft: calculateDistance(order.targetCoords, order.sourceCoords),
                comeback: true,
              } as serverV1.MovementOrder)
              combatLogger(`Pillaged (gold: ${pillage.gold})`)
            }

          } else {
            setStore("world", "fields", targetCoords, "troops", defenderTroops)
            setStore("world", "fields", targetCoords, "resources", r => add(r!, order.resources!))
            combatLogger(`Delivered (gold: ${order.resources!.gold})`)
          }

        } else {
          // Deliver
          setStore("world", "fields", targetCoords, f => ({
            ...f,
            troops: add(f.troops, order.troops),
            resources: add(f.resources!, order.resources!),
          }) as serverV1.World_Field)
          combatLogger(`Delivered (gold: ${order.resources!.gold})`)
        }

      } else {
        newMovementOrders.push({ ...order, timeLeft })
      }
    })
    setStore("world", "movementOrders", newMovementOrders)

    Object.entries(store.world.villages).forEach(([coords, village]) => {
      const field = store.world.fields[coords]

      // Increase resources
      setStore("world", "fields", coords, "resources", r => ({ gold: r!.gold + field.buildings[GOLD_MINE] }))

      // Upgrade buildings
      const newBuildingUpgradeOrders: serverV1.Village_BuildingUpgradeOrder[] = []
      village.buildingUpgradeOrders.forEach((order, index) => {
        if (index == 0) {
          const timeLeft = order.timeLeft - 1
          if (timeLeft == 0) {
            setStore("world", "fields", coords, "buildings", order.buildingId, b => b + 1)
          } else {
            newBuildingUpgradeOrders.push({ ...order, timeLeft })
          }
        } else {
          newBuildingUpgradeOrders.push(order)
        }
      })
      setStore("world", "villages", coords, "buildingUpgradeOrders", newBuildingUpgradeOrders)

      // Train troops
      const newTroopTrainingOrders: serverV1.Village_TroopTrainingOrder[] = []
      village.troopTrainingOrders.forEach((order, index) => {
        if (index == 0) {
          const troop = store.world.troops[order.troopId]
          const timeLeft = order.timeLeft - 1
          let quantity = order.quantity

          if (timeLeft % troop.cost!.time == 0) {
            quantity -= 1
            setStore("world", "fields", coords, "troops", order.troopId, t => t + 1)
          }
          if (timeLeft > 0) {
            newTroopTrainingOrders.push({ ...order, timeLeft, quantity })
          }
        } else {
          newTroopTrainingOrders.push(order)
        }
      })
      setStore("world", "villages", coords, "troopTrainingOrders", newTroopTrainingOrders)
    })
  })
  persistStore()
}

// Movement orders
function state_issueMovementOrder(id: string, sourceCoords: string, targetCoords: string, troops: Record<string, number>, gold: number) {
  const dst = calculateDistance(sourceCoords, targetCoords)
  const order = { id, sourceCoords, targetCoords, troops, resources: newResources({ gold }), timeLeft: dst, playerId } as serverV1.MovementOrder
  batch(() => {
    setStore("world", "fields", sourceCoords, "troops", r => sub(r!, troops))
    setStore("world", "fields", sourceCoords, "resources", "gold", g => g - gold)
    setStore("world", "movementOrders", orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
  })
  persistStore()
}
function state_cancelMovementOrder(id: string) {
  batch(() => {
    setStore("world", "movementOrders", orders => {
      const index = orders.findIndex(o => o.id == id)!
      const order = orders[index]
      if (order.comeback) throw new Error("Can't cancel a comeback order")
      orders[index] = {
        ...order,
        timeLeft: calculateDistance(order.sourceCoords, order.targetCoords) - order.timeLeft,
        comeback: true,
      }
      return orders.slice().sort((a, b) => a.timeLeft - b.timeLeft)
    })
  })
  persistStore()
}

// Building upgrade orders
function state_issueBuildingUpgradeOrder(coords: string, buildingId: string, level: number) {
  const building = store.world.buildings[buildingId]
  const cost = building.cost[level-1]
  const order = { level, buildingId, timeLeft: cost.time } as serverV1.Village_BuildingUpgradeOrder
  batch(() => {
    setStore("world", "villages", coords, "buildingUpgradeOrders", orders => [...orders, order].sort((a, b) => a.timeLeft - b.timeLeft))
    setStore("world", "fields", coords, "resources", r => sub(r!, cost))
  })
  persistStore()
  return order
}
function state_cancelBuildingUpgradeOrder(coords: string, order: serverV1.Village_BuildingUpgradeOrder) {
  const building = store.world.buildings[order.buildingId]
  const cost = building.cost[order.level-1]
  batch(() => {
    setStore("world", "villages", coords, "buildingUpgradeOrders", orders => orders.filter(o => !(o.buildingId == order.buildingId && o.level == order.level)))
    setStore("world", "fields", coords, "resources", r => add(r!, cost))
  })
  persistStore()
}

// Troop training orders
function state_issueTroopTrainingOrder(coords: string, troopId: string, quantity: number) {
  const troop = store.world.troops[troopId]
  const cost = mulN(troop.cost!, quantity) as serverV1.Resources
  const order = { quantity, troopId, timeLeft: cost.time } as serverV1.Village_TroopTrainingOrder
  batch(() => {
    setStore("world", "villages", coords, "troopTrainingOrders", orders => [...orders, order])
    setStore("world", "fields", coords, "resources", r => sub(r!, cost))
  })
  persistStore()
  return order
}
function state_cancelTroopTrainingOrder(coords: string, order: serverV1.Village_TroopTrainingOrder) {
  const troop = store.world.troops[order.troopId]
  const cost = mulN(troop.cost!, order.quantity) as serverV1.Resources
  batch(() => {
    setStore("world", "villages", coords, "troopTrainingOrders", orders => orders.filter(o => !(o.troopId == order.troopId && o.quantity == order.quantity)))
    setStore("world", "fields", coords, "resources", r => add(r!, cost))
  })
  persistStore()
}