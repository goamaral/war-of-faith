import { createSignal, Show, For, Switch, Match, Accessor, Setter, createMemo, createEffect, batch } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import {
  store, playerVillageFields,
  issueTroopTrainingOrder, cancelTroopTrainingOrder,
} from '../store'
import { LEADER, newFieldTroops } from "../entities"
import { add, div, mulN, sub } from "../helpers"
import { cancelBuildingUpgradeOrder, issueBuildingUpgradeOrder } from "../actions/building_upgrade_order"
import { CancelBuildingUpgradeOrder, IssueBuildingUpgradeOrder } from "../state/building_upgrade_order"

function valueCompressor(value: number) {
  if (value < 1000) return value
  return `${Math.floor(value / 100) / 10}K`
}

function trainableLeaders() {
  const maxLeaders = playerVillageFields().length
  const leaders = playerVillageFields().reduce((acc, f) => acc + f.troops[LEADER], 0)
  const leadersInTraining = playerVillageFields()
    .map(f => store.world.villages[f.coords].troopTrainingOrders)
    .flat()
    .filter(o => o.troopId == LEADER)
    .reduce((acc, o) => acc + o.quantity, 0)
  return maxLeaders - leaders - leadersInTraining
}

function canAfford(field: serverV1.World_Field, cost: serverV1.Resources) {
  if (cost.gold > field.resources!.gold) return false
  return true
}

export default function Village({ field }: { field: Accessor<serverV1.World_Field>}) {
  const village = () => store.world.villages[field().coords]

  return <Show when={field().playerId == store.playerId}>
    <h2>Resources</h2>
    <ul>
      <li>{field().resources!.gold} Gold</li>
    </ul>
    <VillageBuildings field={field} village={village} />
    <VillageTroops field={field} village={village} />
  </Show>
}

function VillageBuildings({ field, village }: { field: Accessor<serverV1.World_Field>, village: Accessor<serverV1.Village> }) {
  // TODO: Take into consideration dependencies
  function buildingUpgradeOrderCancelable(order: serverV1.Village_BuildingUpgradeOrder) {
    const orders = village().buildingUpgradeOrders
    const lastOrder = orders[orders.length - 1]
    return lastOrder.buildingId == order.buildingId && lastOrder.level == order.level
  }

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        <For each={Object.keys(field().buildings)}>
          {buildingId => {
            const building = store.world.buildings[buildingId]
            const maxLevel = building.cost.length

            const nextLevel = createMemo(() => IssueBuildingUpgradeOrder.nextLevel(store.world, field().coords, buildingId))
            const cost = createMemo(() => building.cost[nextLevel()-1])
            const level = createMemo(() => field().buildings[buildingId])

            const description = () => `upgrade (lvl ${nextLevel()}, ${cost().time}s, ${cost().gold} gold)`

            return <li>
              <span>{building.name} - lvl {level()} (max level: {maxLevel}) - </span>
              <Switch>
                <Match when={nextLevel() > maxLevel}>
                  <span>max level</span>
                </Match>
                <Match when={!canAfford(field(), cost())}>
                  <button disabled={true}>{description()}</button>
                </Match>
                <Match when={true}>
                  <button onClick={() => issueBuildingUpgradeOrder(field().coords, buildingId, nextLevel())}>{description()}</button>
                </Match>
              </Switch>
            </li>
          }}
        </For>
      </ul>

      <h4>Orders</h4>
      <ul>
        <For each={village().buildingUpgradeOrders}>
          {order => {
            const building = store.world.buildings[order.buildingId]
            return (<li>
              <span>{building.name} (lvl {order.level}) - {order.timeLeft}s </span>
              <Show when={buildingUpgradeOrderCancelable(order)}>
                <button onClick={() => cancelBuildingUpgradeOrder(field().coords, order.buildingId, order.level)}>cancel</button>
              </Show>
            </li>)
          }}
        </For>
      </ul>
    </div>
  )
}

function VillageTroops({ field, village }: { field: Accessor<serverV1.World_Field>, village: Accessor<serverV1.Village> }) {
  const [gridTroopQuantity, setGridTroopQuantity] = createSignal(newFieldTroops())
  const resourcesLeft = createMemo(() => {
    let res = field().resources!
    for (const troopId in store.world.troops) {
      res = sub(res, mulN(store.world.troops[troopId].cost!, gridTroopQuantity()[troopId]))
    }
    res.time = 0
    return res
  })
  const trainableTroopsMemo = createMemo(() => {
    const _gridTroopQuantity = gridTroopQuantity()
    const _resourcesLeft = resourcesLeft()

    return (troopId: string) => {
      const troop = store.world.troops[troopId]
      const troopQuantityCost = mulN(troop.cost!, _gridTroopQuantity[troopId])
      let trainable = Math.floor(div(add(_resourcesLeft, troopQuantityCost), troop.cost!, k => k != "time"))
      if (troopId == LEADER) return Math.min(trainable, trainableLeaders())
      return trainable
    }
  })
  const trainableTroops = (troopId: string) => trainableTroopsMemo()(troopId)

  // Prevent invalid inputs
  createEffect(() => {
    const _gridTroopQuantity = gridTroopQuantity()
    batch(() => {
      Object.entries(_gridTroopQuantity).forEach(([troopId, quantity]) => {
        if (quantity < 0) return setGridTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: 0 }))
        if (quantity > trainableTroops(troopId)) {
          return setGridTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: trainableTroops(troopId) }))
        }
      })
    })
  })

  return (
    <div>
      <h2>Troops</h2>
      <div class="grid [grid-template-columns:max-content_max-content_max-content_max-content_max-content] gap-x-4 gap-y-2 items-center">
        {/* Header */}
        <div class="font-bold">Unit</div>
        <div class="font-bold">Requirements</div>
        <div class="font-bold">Total</div>
        <div class="font-bold">Recruit (max)</div>
        <div class="font-bold"></div>
        {/* Body */}
        <For each={Object.keys(store.world.troops)}>{(troopId) => {
          const troop = store.world.troops[troopId]
          const fieldQuantity = () => field().troops[troopId]
          const fieldQuantityInTraining = createMemo(() => village().troopTrainingOrders.reduce((acc, order) => acc + (troopId == order.troopId ? order.quantity : 0), 0))
          const cost = createMemo(() => mulN(troop.cost!, gridTroopQuantity()[troopId]))
          const description = () => `train (${cost().time}s, ${cost().gold} gold)`
          const train = (quantity: number) => {
            issueTroopTrainingOrder(field().coords, troopId, quantity)
            setGridTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: 0 }))
          }

          return <>
            <div style="word-break:break-word">{troop.name}</div>
            <div>{troop.cost!.gold} gold, {troop.cost!.time}s</div>
            <div>{fieldQuantity()} ({fieldQuantityInTraining()})</div>

            <div>
              <div class="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={trainableTroops(troopId)}
                  class="input input-bordered input-sm flex-shrink w-full rounded-r-none border-r-0"
                  value={gridTroopQuantity()[troopId]}
                  onInput={e => setGridTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: +e.currentTarget.value }))}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") return train(gridTroopQuantity()[troopId])
                    if (e.key == "Escape") e.currentTarget.blur()
                  }}
                />
                <button
                  class="btn btn-outline btn-sm rounded-l-none flex-none w-1/3"
                  disabled={trainableTroops(troopId) == 0}
                  onClick={() => train(trainableTroops(troopId))}
                >
                  {valueCompressor(trainableTroops(troopId))}
                </button>
              </div>
            </div>

            <div>
              <button
                class="btn btn-outline btn-sm"
                disabled={gridTroopQuantity()[troopId] == 0 || trainableTroops(troopId) == 0}
                onClick={() => train(gridTroopQuantity()[troopId])}>
                {description()}
              </button>
            </div>
          </>
        }}</For>
      </div>

      <h4>Orders</h4>
      <ul>
        <For each={village().troopTrainingOrders}>{order => {
          const troop = store.world.troops[order.troopId]
          return <li>
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTroopTrainingOrder(field().coords, order)}>cancel</button>
          </li>
        }}</For>
      </ul>
    </div>
  )
}
