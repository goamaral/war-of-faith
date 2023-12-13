import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'preact/hooks'
import { Signal, useComputed, useSignal, useSignalEffect } from '@preact/signals'

import * as serverV1 from "../lib/protobuf/server/v1/server_pb"
import * as entities from './entities'
import server from './server'

function useForceRender() {
  const [state, setState] = useState(true)
  return () => setState(!state)
}

export default () => {
  const { id } = useParams() as { id: string }

  const loading = useSignal(true)
  // TODO: Create Context with village, troops, trainableLeaders
  const village = useSignal<entities.Village>(new entities.Village(new serverV1.Village()))
  const troops = useSignal<entities.Troop[]>([])
  const trainableLeaders = useSignal<number>(0)
  const forceRender = useForceRender() // TODO: Try to remove this by using village signal

  async function updateVillage() {
    const res = await server.getVillage({ id: +id })
    village.value = new entities.Village(res.village!)
  }

  async function updatePlayer() {
    const res = await server.getPlayer({})
    trainableLeaders.value = res.player!.trainableLeaders
  }

  useEffect(() => {
    Promise.all([
      updateVillage(),
      updatePlayer(),
      server.getTroops({}).then(res => troops.value = res.troops.map(t => new entities.Troop(t))),
    ])
      .then(() => loading.value = false)
      .catch(err => alert(err))
  }, [])

  // TODO: Replace with SSE
  useSignalEffect(() => {
    const intervalId = loading.value ? 0 : setInterval(async () => {
      Promise.all([
        updateVillage(),
        updatePlayer(),
      ])
        .catch(err => alert(err))

    }, 1000)

    return () => {
      if (intervalId !== -1) clearInterval(intervalId)
    }
  })

  if (loading.value) {
    return <div>Loading...</div>
  } else {
    return <Village village={village} troops={troops} trainableLeaders={trainableLeaders} forceRender={forceRender} />
  }
}

type VillageProps = {
  village: Signal<entities.Village>,
  troops: Signal<entities.Troop[]>,
  trainableLeaders: Signal<number>,
  forceRender: () => void,
}
const Village = ({ village, troops, trainableLeaders, forceRender }: VillageProps) => {
  return (
    <div>
      <h1>Village {village.value.id}</h1>
      <h2>Resources</h2>
      <ul>
        <li>{village.value.gold} Gold</li>
      </ul>
      <VillageBuildings village={village} forceRender={forceRender} />
      <VillageTroops village={village} troops={troops} trainableLeaders={trainableLeaders} forceRender={forceRender} />
    </div>
  )
}

const VillageBuildings = ({ village, forceRender }: { village: Signal<entities.Village>, forceRender: () => void }) => {
  async function cancelBuildingUpgradeOrder(order: entities.BuildingUpgradeOrder) {
    try {
      await server.cancelBuildingUpgradeOrder({ id: order.id })
      village.peek().removeBuildingUpgradeOrder(order.id)
      village.peek().addGold(order.building.upgradeCost().gold)
      forceRender()
    } catch (err) {
      alert(`Failed to cancel building upgrade order (id: ${order.id}): ${err}`)
    }
  }

  function orderCancelable(order: entities.BuildingUpgradeOrder): boolean {
    const orders = order.building.upgradeOrders
    const index = orders.findIndex(o => o.id === order.id)
    return index == orders.length - 1
  }

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {village.value.buildings.map(building => <VillageBuilding village={village.value} building={building} forceRender={forceRender} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.value.buildingUpgradeOrders.map(order => {
          return (<li>
            {order.building.name} (lvl {order.level}) - {order.timeLeft}s {
              orderCancelable(order) ? <button onClick={() => cancelBuildingUpgradeOrder(order)}>cancel</button> : <></>
            }
          </li>)
        })}
      </ul>
    </div>
  )
}

function VillageBuilding({ village, building, forceRender }: { village: entities.Village, building: entities.Building, forceRender: () => void }) {
  async function issueUpgradeOrder(building: entities.Building) {
    try {
      const { order } = await server.issueBuildingUpgradeOrder({ buildingId: building.id })
      village.addBuildingUpgradeOrder(new entities.BuildingUpgradeOrder(order!, village))
      village.addGold(-order?.cost?.gold!)
      forceRender()
    } catch (err) {
      alert(`Failed to issue building upgrade order for ${building.name} (level: ${building.nextLevel}): ${err}`)
    }
  }
  
  const upgradeCost = building.upgradeCost()
  const children = []
  switch (building.upgradeStatus()) {
    case entities.BuildingUpgradeStatus.UPGRADABLE:
      children.push(
        <button onClick={() => issueUpgradeOrder(building)}>upgrade (lvl {building.nextLevel}, {upgradeCost.time}s, {upgradeCost.gold} gold)</button>
      )
      break

    case entities.BuildingUpgradeStatus.MAX_LEVEL:
      break

    case entities.BuildingUpgradeStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <button disabled={true}>upgrade (lvl {building.nextLevel}, {upgradeCost.time}s, {upgradeCost.gold} gold)</button>
      )
      break

    default:
      throw new Error(`Unknown building upgrade status: ${building.upgradeStatus().toString()}`)
  }

  return <li>
    {building.name} - lvl {building.level}
    {children}
  </li>
}

const VillageTroops = ({ village, troops, trainableLeaders, forceRender }: { village: Signal<entities.Village>, troops: Signal<entities.Troop[]>, trainableLeaders: Signal<number>, forceRender: () => void }) => {
  function getTroop(kind: entities.TroopKind) {
    return troops.peek().find(t => t.kind == kind)!
  }

  async function cancelTrainingOrder(order: entities.TroopTrainingOrder, troop: entities.Troop) {
    try {
      await server.cancelTroopTrainingOrder({ id: order.id })
      village.peek().removeTroopTrainingOrder(order.id)
      village.peek().addGold(troop.trainCost(order.quantity).gold)
      forceRender()
    } catch (err) {
      alert(`Failed to cancel troop training order (id: ${order.id}): ${err}`)
    }
  }

  return (
    <div>
      <h2>Troops</h2>
      <ul>
        {troops.value.map(troop => <VillageTroop village={village} troop={troop} trainableLeaders={trainableLeaders} forceRender={forceRender} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.value.troopTrainingOrders.map(order => {
          const troop = getTroop(order.troopKind)
          return (<li>
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(order, troop)}>cancel</button>
          </li>)
        })}
      </ul>
    </div>
  )
}

function VillageTroop({ village, troop, trainableLeaders, forceRender }: { village: Signal<entities.Village>, troop: entities.Troop, trainableLeaders: Signal<number>, forceRender: () => void }) {
  async function issueTrainingOrder(troopKind: entities.TroopKind, quantity: number) {
    try {
      const { order } = await server.issueTroopTrainingOrder({ troopKind, quantity, villageId: village.peek().id })
      village.peek().addTroopTrainingOrder(new entities.TroopTrainingOrder(order!, village.peek()))
      village.peek().addGold(-order?.cost?.gold!)
      forceRender()
    } catch (err) {
      alert(`Failed to issue troop training order (troopKind: ${troopKind}, quantity: ${quantity}): ${err}`)
    }
  }

  const quantityToTrain = useSignal(1)

  const quantity = useComputed(() => village.value.troopQuantity[troop.kind] ?? 0)
  const max = useComputed(() => troop.kind == entities.TroopKind.LEADER ? trainableLeaders.value : undefined)
  const quantityInTraining = useComputed(() => village.value.troopTrainingOrders.reduce((acc, order) => {
    return acc + (troop.kind == troop.kind ? order.quantity : 0)
  }, 0))
  const trainableTroops = useComputed(() => troop.kind == entities.TroopKind.LEADER ? trainableLeaders.value : undefined)

  const children = []
  switch (village.value.troopTrainingStatus(troop, quantity.value, trainableTroops.value)) {
    case entities.TroopTrainingStatus.TRAINABLE:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={max.value} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button onClick={() => issueTrainingOrder(troop.kind, quantityToTrain.value)}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={max.value} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button disabled={true}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.MAX_TRAINABLE:
      break

    default:
      throw new Error(`Unknown village troop train status: ${village.peek().troopTrainingStatus(troop, quantity.peek())}`)
  }

  return <li>
    {troop.name} - {quantity} ({quantityInTraining})
    {children}
  </li>
}