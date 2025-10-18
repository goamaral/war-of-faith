import { createSignal, Show, For, Switch, Match } from "solid-js"
import { useParams } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import {
  StoreLoader, store, mul,
  issueBuildingUpgradeOrder, cancelBuildingUpgradeOrder, 
  issueTroopTrainingOrder, cancelTroopTrainingOrder,
  playerVillageFields
} from './store'
import { LEADER } from "./entities"

let villageCoords = ""

function field() {
  return store.world.fields[villageCoords]
}

function village() {
  return store.world.villages[villageCoords]
}

// TODO: Take into consideration dependencies
function buildingUpgradeOrderCancelable(order: serverV1.Village_BuildingUpgradeOrder) {
  const orders = village().buildingUpgradeOrders
  const lastOrder = orders[orders.length - 1]
  return lastOrder.buildingId == order.buildingId && lastOrder.level == order.level
}

function getBuildingNextLevel(buildingId: string): number {
  const f = field()
  const v = village()
  const orders = v.buildingUpgradeOrders.filter(o => o.buildingId == buildingId)
  return f.buildings[buildingId] + orders.length + 1
}

function canAfford(cost: serverV1.Resources) {
  if (cost.gold > field().resources!.gold) return false
  return true
}

// TODO: Hide village details if you're not the player
export default function VillagePage() {
  const { coords } = useParams() as { coords: string }
  villageCoords = coords

  return <StoreLoader>
    {() =>
      <div>
        <h1>Village {villageCoords}</h1>
        <h2>Resources</h2>
        <ul>
          <li>{field().resources!.gold} Gold</li>
        </ul>
        <VillageBuildings />
        <VillageTroops />
      </div>
    }
  </StoreLoader>
}

function VillageBuildings() {
  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        <For each={Object.keys(field().buildings)}>
          {buildingId => {
            const building = store.world.buildings[buildingId]
            const maxLevel = building.cost.length

            const nextLevel = () => getBuildingNextLevel(buildingId)
            const cost = () => building.cost[nextLevel()-1]
            const level = () => field().buildings[buildingId]

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
                  <button onClick={() => issueBuildingUpgradeOrder(villageCoords, buildingId, nextLevel())}>{description()}</button>
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
            return (<li>
              <span>{order.buildingId} (lvl {order.level}) - {order.timeLeft}s </span>
              <Show when={buildingUpgradeOrderCancelable(order)}>
                <button onClick={() => cancelBuildingUpgradeOrder(villageCoords, order)}>cancel</button>
              </Show>
            </li>)
          }}
        </For>
      </ul>
    </div>
  )
}

function VillageTroops() {
  return (
    <div>
      <h2>Troops</h2>
      <ul>
        <For each={Object.keys(store.world.troops)}>
          {(troopId) => {
            const troop = store.world.troops[troopId]

            const [quantityToTrain, setQuantityToTrain] = createSignal(1)

            const quantity = () => field().troops[troopId]
            const quantityInTraining = () => village().troopTrainingOrders.reduce((acc, order) => {
              return acc + (troopId == order.troopId ? order.quantity : 0)
            }, 0)
            const trainableTroops = () => {
              if (troopId == LEADER) {
                const maxLeaders = playerVillageFields().length
                return maxLeaders - quantity() - quantityInTraining()
              }
              return undefined
            }
            const cost = () => mul(troop.cost!, quantityToTrain())

            const description = () => `train (${cost().time}s, ${cost().gold} gold)`

            function Counter() {
              return <input type="number" min={0} max={trainableTroops()}
                value={quantityToTrain()}
                onChange={e => setQuantityToTrain(+e.currentTarget.value)}
              />
            }

            return <li>
              <span>{troop.name} - {quantity()} units ({quantityInTraining()} training)</span>
              <Switch>
                <Match when={trainableTroops() == 0}>
                  <></>
                </Match>
                <Match when={!canAfford(cost())}>
                  <Counter />
                  <button disabled={true}>{description()}</button>
                </Match>
                <Match when={true}>
                  <Counter />
                  <button onClick={() => issueTroopTrainingOrder(villageCoords, troopId, quantityToTrain())}>{description()}</button>
                </Match>
              </Switch>
            </li>
          }}
        </For>
      </ul>
      <h4>Orders</h4>
      <ul>
        <For each={village().troopTrainingOrders}>
          {order => {
            const troop = store.world.troops[order.troopId]
            return <li>
              {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTroopTrainingOrder(villageCoords, order)}>cancel</button>
            </li>
          }}
        </For>
      </ul>
    </div>
  )
}