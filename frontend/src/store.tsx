import type { JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { batch, onCleanup, onMount, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"

import type { Mutator } from "./state/mutator"
import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import { serverCli } from './api'
import {
  newVillage, newWildField, newFieldTroops,
  GOLD_MINE, LEADER, RAIDER,
} from './entities'
import { combatLogger, endingLogger } from "./logger"
import { add, calcDist, countTroops, encodeCoords, mulN, sub } from "./helpers"
import { CARRIABLE_GOLD_PER_UNIT } from "./state/movement_orders"

export const [store, setStore] = createStore({
  loaded: false,
  world: {} as serverV1.World,
  playerId: "",
})

declare global {
  interface Window {
    resetStore: () => void
  }
}
window.resetStore = function() {
  localStorage.removeItem("store")
  location.reload()
}

// Persistence
export function persistStore() {
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

    const store = { loaded: true, world, playerId: "1" }
    setStore(store)
    localStorage.setItem("store", JSON.stringify(store))
  }
}

// Helpers
export function playerFields(filter?: (f: serverV1.World_Field) => boolean) {
  return Object.values(store.world.fields).filter(f => f.playerId == store.playerId && (!filter || filter(f)))
}
export function playerVillageFields(filter?: (f: serverV1.World_Field) => boolean) {
  return playerFields(filter).filter(f => f.kind == serverV1.World_Field_Kind.VILLAGE)
}

export function StoreLoader({ children }: { children: () => JSX.Element }) {
  const navigate = useNavigate()
  const handleKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT') return
    if (e.key === 'w') return navigate('/world')
    if (e.key === 'v') return navigate('/villages')
    const villageNumber = Number.parseInt(e.key)
    if (Number.isInteger(villageNumber)) {
      const villageIndex = (villageNumber == 0 ? 10 : villageNumber)-1
      const villageCoords = store.world.players[store.playerId].villageKeyBindings[villageIndex]
      if (villageCoords) return navigate(`/world/${villageCoords}`)
    }
  }

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
      document.addEventListener('keydown', handleKeyDown)
    }
    setup()

    onCleanup(() => clearInterval(intervalId))
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
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

const winConditionOwnershipAge = 1*60 // 5 min
function checkWinCondition() {
  let winner = undefined
  for (const coords of Object.keys(store.world.temples)) {
    const playerId = store.world.fields[coords].playerId
    if (winner && winner != playerId) return false
    winner = playerId
  }
  if (!winner) return false

  endingLogger(`Player ${winner} controls all temples`)

  let timeLeft = 0
  for (const temple of Object.values(store.world.temples)) {
    if (temple.ownershipAge < winConditionOwnershipAge) timeLeft = Math.max(timeLeft, winConditionOwnershipAge - temple.ownershipAge)
  }
  if (timeLeft > 0) {
    endingLogger(`Win in ${timeLeft} seconds`)
    return false
  }

  if (!winner) return false
  const ok = window.confirm("Player " + winner + " won. Reset the game?")
  if (ok) {
    window.resetStore()
    return true
  }

  return false
}

/* State machine */
function state_tick() {
  batch(() => {
    /* Temples */
    Object.entries(store.world.temples).forEach(([coords, temple]) => {
      setStore("world", "temples", coords, { ...temple, ownershipAge: temple.ownershipAge + 1 })
    })

    /* Win condition */
    if (checkWinCondition()) return

    /* Villages */
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

    /* Movement orders */
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
              // Set source player village key binding
              {
                const index = store.world.players[order.playerId].villageKeyBindings.findIndex(c => !c)
                if (index != -1) {
                  setStore("world", "players", order.playerId, "villageKeyBindings", index, targetCoords)
                } else if (store.world.players[order.playerId].villageKeyBindings.length < 10) {
                  setStore("world", "players", order.playerId, "villageKeyBindings", villageKeyBindings => villageKeyBindings.concat(targetCoords))
                }
              }

              // Unset target player village key binding
              if (targetField.playerId) {
                const index = store.world.players[targetField.playerId].villageKeyBindings.findIndex(c => c == targetCoords)
                if (index != -1) {
                  setStore("world", "players", targetField.playerId, "villageKeyBindings", index, "")
                }
              }

              // World field
              setStore("world", "fields", targetCoords, f => ({
                ...f,
                kind: targetField.kind == serverV1.World_Field_Kind.TEMPLE ? serverV1.World_Field_Kind.TEMPLE : serverV1.World_Field_Kind.VILLAGE,
                troops: attackerTroops,
                resources: add(f.resources!, order.resources!),
                playerId: order.playerId,
              }) as serverV1.World_Field)

              // Temple | village
              if (targetField.kind == serverV1.World_Field_Kind.TEMPLE) {
                setStore("world", "temples", targetCoords, t => ({ ...t, ownershipAge: 0 }))
              } else {
                setStore("world", "villages", targetCoords, newVillage())
              }

              combatLogger(`Field ${targetCoords} conquered`)

            } else {
              // Pillage
              const pillage = { gold: Math.min(targetField.resources!.gold, troopsLeft * CARRIABLE_GOLD_PER_UNIT) } as serverV1.Resources
              setStore("world", "fields", targetCoords, "resources", r => sub(r!, pillage))
              newMovementOrders.push({
                ...order,
                troops: attackerTroops,
                resources: pillage,
                timeLeft: calcDist(order.targetCoords, order.sourceCoords),
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

    persistStore()
  })
}

export const mutator: Mutator = {
  setFieldTroops: (coords: string, set) => setStore("world", "fields", coords, "troops", set),
  setFieldGold: (coords: string, set) => setStore("world", "fields", coords, "resources", "gold", set),
  setMovementOrders: (set) => setStore("world", "movementOrders", set),
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
