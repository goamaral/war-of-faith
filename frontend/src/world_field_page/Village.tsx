import { createSignal, Show, For, Switch, Match, Accessor, Setter } from "solid-js"

import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import {
  store, mulN, div, sub, add,
  issueBuildingUpgradeOrder, cancelBuildingUpgradeOrder, 
  issueTroopTrainingOrder, cancelTroopTrainingOrder,
  playerVillageFields, playerId
} from '../store'
import { LEADER, newFieldTroops } from "../entities"

let villageField = () => ({} as serverV1.World_Field)

function village() {
  return store.world.villages[villageField()!.coords]
}

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

// TODO: Take into consideration dependencies
function buildingUpgradeOrderCancelable(order: serverV1.Village_BuildingUpgradeOrder) {
  const orders = village().buildingUpgradeOrders
  const lastOrder = orders[orders.length - 1]
  return lastOrder.buildingId == order.buildingId && lastOrder.level == order.level
}

function getBuildingNextLevel(buildingId: string): number {
  const f = villageField()
  const v = village()
  const orders = v.buildingUpgradeOrders.filter(o => o.buildingId == buildingId)
  return f.buildings[buildingId] + orders.length + 1
}

function canAfford(cost: serverV1.Resources) {
  if (cost.gold > villageField().resources!.gold) return false
  return true
}

export default function Village({ field }: { field: Accessor<serverV1.World_Field>}) {
  villageField = field

  return <Show when={field().playerId == playerId}>
    <h2>Resources</h2>
    <ul>
      <li>{field().resources!.gold} Gold</li>
    </ul>
    <VillageBuildings />
    <VillageTroops />
  </Show>
}

function VillageBuildings() {
  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        <For each={Object.keys(villageField().buildings)}>
          {buildingId => {
            const building = store.world.buildings[buildingId]
            const maxLevel = building.cost.length

            const nextLevel = () => getBuildingNextLevel(buildingId)
            const cost = () => building.cost[nextLevel()-1]
            const level = () => villageField().buildings[buildingId]

            const description = () => `upgrade (lvl ${nextLevel()}, ${cost().time}s, ${cost().gold} gold)`

            return <li>
              <span>{building.name} - lvl {level()} (max level: {maxLevel}) - </span>
              <Switch>
                <Match when={nextLevel() > maxLevel}>
                  <span>max level</span>
                </Match>
                <Match when={!canAfford(cost())}>
                  <button disabled={true}>{description()}</button>
                </Match>
                <Match when={true}>
                  <button onClick={() => issueBuildingUpgradeOrder(villageField().coords, buildingId, nextLevel())}>{description()}</button>
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
                <button onClick={() => cancelBuildingUpgradeOrder(villageField().coords, order)}>cancel</button>
              </Show>
            </li>)
          }}
        </For>
      </ul>
    </div>
  )
}

function VillageTroops() {
  const [troopQuantity, setTroopQuantity] = createSignal(newFieldTroops())
  const resourcesLeft = () => {
    let res = villageField().resources!
    for (const troopId in store.world.troops) {
      res = sub(res, mulN(store.world.troops[troopId].cost!, troopQuantity()[troopId]))
    }
    res.time = 0
    return res
  }

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
          const quantity = () => villageField().troops[troopId]
          const quantityInTraining = () => village().troopTrainingOrders.reduce((acc, order) => acc + (troopId == order.troopId ? order.quantity : 0), 0)
          const trainableTroops = () => {
            const troopQuantityCost = mulN(troop.cost!, troopQuantity()[troopId])
            let trainable = Math.floor(div(add(resourcesLeft(), troopQuantityCost), troop.cost!, k => k != "time"))
            if (troopId == LEADER) return Math.min(trainable, trainableLeaders())
            return trainable
          }
          const cost = () => mulN(troop.cost!, troopQuantity()[troopId])
          const description = () => `train (${cost().time}s, ${cost().gold} gold)`

          return <>
            <div style="word-break:break-word">{troop.name}</div>
            <div>{troop.cost!.gold} gold, {troop.cost!.time}s</div>
            <div>{quantity()} ({quantityInTraining()})</div>

            <div>
              <div class="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={trainableTroops()}
                  class="input input-bordered input-sm flex-shrink w-full rounded-r-none border-r-0"
                  value={troopQuantity()[troopId]}
                  onInput={e => setTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: +e.currentTarget.value }))}
                />
                <button
                  class="btn btn-outline btn-sm rounded-l-none flex-none w-1/3"
                  disabled={trainableTroops() == 0}
                  onClick={() => setTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: trainableTroops() }))}
                >
                  {valueCompressor(trainableTroops())}
                </button>
              </div>
            </div>

            <div>
              <button
                class="btn btn-outline btn-sm"
                disabled={trainableTroops() == 0}
                onClick={() => {
                  issueTroopTrainingOrder(villageField().coords, troopId, troopQuantity()[troopId])
                  setTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: 0 }))
                }}>
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
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTroopTrainingOrder(villageField().coords, order)}>cancel</button>
          </li>
        }}</For>
      </ul>
    </div>
  )
}