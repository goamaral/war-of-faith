import { createSignal, Show, For, Switch, Match, Accessor, createMemo, createEffect, batch } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { cancelBuildingUpgradeOrder, issueBuildingUpgradeOrder } from "../actions/building_upgrade_order"
import { cancelTrainingOrder, issueTrainingOrder } from "../actions/training_orders"
import { IssueBuildingUpgradeOrder } from "../state/building_upgrade_order"
import { IssueTrainingOrder } from "../state/training_orders"
import { store } from '../store'
import { fieldCanAfford, mulN } from "../state/helpers"
import { newFieldTroops } from "../state/config"

function valueCompressor(value: number) {
  if (value < 1000) return value
  return `${Math.floor(value / 100) / 10}K`
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
        <For each={Object.keys(field().buildingLevels)}>
          {buildingId => {
            const building = store.world.buildings[buildingId]
            const maxLevel = building.cost.length

            const nextLevel = createMemo(() => IssueBuildingUpgradeOrder.nextLevel(store.world, field().coords, buildingId))
            const cost = createMemo(() => building.cost[nextLevel()-1])
            const level = createMemo(() => field().buildingLevels[buildingId])

            const description = () => `upgrade (lvl ${nextLevel()}, ${cost().time}s, ${cost().gold} gold)`

            return <li>
              <span>{building.name} - lvl {level()} (max level: {maxLevel}) - </span>
              <Switch>
                <Match when={nextLevel() > maxLevel}>
                  <span>max level</span>
                </Match>
                <Match when={!fieldCanAfford(field(), cost())}>
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
  const [troopQuantityPlan, setTroopQuantityPlan] = createSignal(newFieldTroops())
  const trainableTroops = createMemo(() => IssueTrainingOrder.trainableTroops(store.world, store.playerId, field().coords, troopQuantityPlan()))

  // Prevent invalid inputs
  createEffect(() => {
    const _troopQuantityPlan = troopQuantityPlan()
    batch(() => {
      Object.entries(_troopQuantityPlan).forEach(([troopId, quantity]) => {
        if (quantity < 0) return setTroopQuantityPlan(prev => ({ ...prev, [troopId]: 0 }))
        if (quantity > trainableTroops()[troopId]) return setTroopQuantityPlan(prev => ({ ...prev, [troopId]: trainableTroops()[troopId] }))
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
          const fieldQuantityInTraining = createMemo(() => village().trainingOrders.reduce((acc, order) => acc + (troopId == order.troopId ? order.quantity : 0), 0))
          const cost = createMemo(() => mulN(troop.cost!, troopQuantityPlan()[troopId]))
          const description = () => `train (${cost().time}s, ${cost().gold} gold)`
          const train = (quantity: number) => {
            issueTrainingOrder(field().coords, troopId, quantity)
            setTroopQuantityPlan(prev => ({ ...prev, [troopId]: 0 }))
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
                  max={trainableTroops()[troopId]}
                  class="input input-bordered input-sm flex-shrink w-full rounded-r-none border-r-0"
                  value={troopQuantityPlan()[troopId]}
                  onInput={e => setTroopQuantityPlan(prev => ({ ...prev, [troopId]: +e.currentTarget.value }))}
                  onKeyDown={(e) => {
                    if (e.key == "Enter") return train(troopQuantityPlan()[troopId])
                    if (e.key == "Escape") e.currentTarget.blur()
                  }}
                />
                <button
                  class="btn btn-outline btn-sm rounded-l-none flex-none w-1/3"
                  disabled={trainableTroops()[troopId] == 0}
                  onClick={() => train(trainableTroops()[troopId])}
                >
                  {valueCompressor(trainableTroops()[troopId])}
                </button>
              </div>
            </div>

            <div>
              <button
                class="btn btn-outline btn-sm"
                disabled={troopQuantityPlan()[troopId] == 0 || trainableTroops()[troopId] == 0}
                onClick={() => train(troopQuantityPlan()[troopId])}>
                {description()}
              </button>
            </div>
          </>
        }}</For>
      </div>

      <h4>Orders</h4>
      <ul>
        <For each={village().trainingOrders}>{order => {
          const troop = store.world.troops[order.troopId]
          return <li>
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(field().coords, order)}>cancel</button>
          </li>
        }}</For>
      </ul>
    </div>
  )
}
