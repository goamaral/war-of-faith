import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'

import { combatLogger, endingLogger } from '../logger'
import { CARRIABLE_GOLD_PER_UNIT, GOLD_MINE, LEADER, newFieldTroops, newResources, newVillage, RAIDER, WIN_CONDITION_OWNERSHIP_AGE_SECS } from './config'
import { add, calcDist, countTroops, sub } from './helpers'
import { Mutator } from "./mutator"

function checkWinCondition(world: serverV1.World) {
  let winner = undefined
  for (const coords of Object.keys(world.temples)) {
    const playerId = world.fields[coords].playerId
    if (winner && winner != playerId) return false
    winner = playerId
  }
  if (!winner) return false

  endingLogger(`Player ${winner} controls all temples`)

  let timeLeft = 0
  for (const [coords, temple] of Object.entries(world.temples)) {
    if (temple.ownershipAgeSecs < WIN_CONDITION_OWNERSHIP_AGE_SECS) {
      timeLeft = Math.max(timeLeft, WIN_CONDITION_OWNERSHIP_AGE_SECS - temple.ownershipAgeSecs)
    }
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

export function tick(world: serverV1.World, mut: Mutator) {
  /* Temples */
  Object.keys(world.temples).forEach(coords => world = mut.setTemple(coords, t => ({ ...t, ownershipAgeSecs: t.ownershipAgeSecs + 1 })))

  /* Win condition */
  if (checkWinCondition(world)) return true

  /* Villages */
  Object.entries(world.villages).forEach(([coords, village]) => {
    const field = world.fields[coords]

    // Increase resources
    world = mut.setFieldResources(coords, r => newResources({ gold: r!.gold + field.buildingLevels[GOLD_MINE] }))

    // Upgrade buildings
    const newBuildingUpgradeOrders: serverV1.Village_BuildingUpgradeOrder[] = []
    village.buildingUpgradeOrders.forEach((order, index) => {
      if (index == 0) {
        const timeLeft = order.timeLeft - 1
        if (timeLeft == 0) {
          world = mut.setFieldBuidingLevels(coords, lvls => ({ ...lvls, [order.buildingId]: lvls[order.buildingId] + 1 }))
        } else {
          newBuildingUpgradeOrders.push({ ...order, timeLeft })
        }
      } else {
        newBuildingUpgradeOrders.push(order)
      }
    })
    world = mut.setVillageBuildingUpgradeOrders(coords, () => newBuildingUpgradeOrders)

    // Train troops
    const newTrainingOrders: serverV1.Village_TrainingOrder[] = []
    village.trainingOrders.forEach((order, index) => {
      if (index == 0) {
        const troop = world.troops[order.troopId]
        const timeLeft = order.timeLeft - 1
        let quantity = order.quantity

        if (timeLeft % troop.cost!.time == 0) {
          quantity -= 1
          world = mut.setFieldTroops(coords, troops => ({ ...troops, [order.troopId]: troops[order.troopId] + 1 }))
        }
        if (timeLeft > 0) {
          newTrainingOrders.push({ ...order, timeLeft, quantity })
        }
      } else {
        newTrainingOrders.push(order)
      }
    })
    world = mut.setVillageTrainingOrders(coords, () => newTrainingOrders)
  })

  /* Movement orders */
  const newMovementOrders: serverV1.MovementOrder[] = []
  world.movementOrders.forEach(order => {
    const targetCoords = order.comeback ? order.sourceCoords : order.targetCoords
    const timeLeft = order.timeLeft - 1
    if (timeLeft == 0) {
      const targetField = world.fields[targetCoords]
      if (targetField.playerId != order.playerId) {
        // Combat
        const attackerTroops = newFieldTroops(order.troops)
        const defenderTroops = newFieldTroops(targetField.troops)
        const getTroops = (troops: Record<string, number>) => {
          if (troops[RAIDER] > 0) return { troopId: RAIDER, quantity: troops[RAIDER] }
          if (troops[LEADER] > 0) return { troopId: LEADER, quantity: troops[LEADER] }
          return { troopId: undefined, quantity: 0 }
        }
        while (true) {
          const { troopId: attackerTroopId, quantity: attackerQuantity } = getTroops(attackerTroops)
          if (attackerTroopId == undefined) {
            combatLogger("Attacker lost")
            break
          }
          const { troopId: defenderTroopId, quantity: defenderQuantity } = getTroops(defenderTroops)
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
            // World field
            world = mut.setField(targetCoords, f => ({
              ...f,
              kind: targetField.kind == serverV1.World_Field_Kind.TEMPLE ? serverV1.World_Field_Kind.TEMPLE : serverV1.World_Field_Kind.VILLAGE,
              troops: attackerTroops,
              resources: add(f.resources!, order.resources!),
              playerId: order.playerId,
            }) as serverV1.World_Field)

            // Temple | Village
            if (targetField.kind == serverV1.World_Field_Kind.TEMPLE) {
              world = mut.setTemple(targetCoords, t => ({ ...t, ownershipAgeSecs: 0 }))

            } else {
              // Set source player village key binding
              {
                const index = world.players[order.playerId].villageKeyBindings.findIndex(c => !c)
                if (index != -1) {
                  world = mut.setPlayerVillageKeyBindings(order.playerId, bindings => {
                    bindings[index] = targetCoords
                    return [...bindings]
                  })
                } else if (world.players[order.playerId].villageKeyBindings.length < 10) {
                  world = mut.setPlayerVillageKeyBindings(order.playerId, bindings => bindings.concat(targetCoords))
                }
              }

              // Unset target player village key binding
              if (targetField.playerId) {
                const index = world.players[targetField.playerId].villageKeyBindings.findIndex(c => c == targetCoords)
                if (index != -1) {
                  world = mut.setPlayerVillageKeyBindings(targetField.playerId, bindings => {
                    bindings[index] = ""
                    return [...bindings]
                  })
                }
              }

              world = mut.setVillage(targetCoords, () => newVillage())
            }

            combatLogger(`Field ${targetCoords} conquered`)

          } else {
            // Pillage
            const pillage = { gold: Math.min(targetField.resources!.gold, troopsLeft * CARRIABLE_GOLD_PER_UNIT) } as serverV1.Resources
            world = mut.setFieldResources(targetCoords, r => sub(r!, pillage))
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
          world = mut.setFieldTroops( targetCoords, () => defenderTroops)
          world = mut.setFieldResources(targetCoords, r => add(r!, order.resources!))
          combatLogger(`Delivered (gold: ${order.resources!.gold})`)
        }

      } else {
        // Deliver
        world = mut.setField(targetCoords, f => ({
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
  world = mut.setMovementOrders(() => newMovementOrders)

  return false
}