import { useParams } from 'react-router-dom'
import { useEffect } from 'preact/hooks'
import { useSignal, useSignalEffect } from '@preact/signals'

import * as entities from './entities'
import server from './server'

function useForceRender() {
  const state = useSignal(true)
  return () => state.value = !state.value
}

export default () => {
  const { id } = useParams() as { id: string }

  const loading = useSignal(true)
  const village = useSignal<entities.Village | undefined>(undefined)
  const troops = useSignal<entities.Troop[]>([])
  const forceRender = useForceRender()

  async function updateVillage() {
    const res = await server.getVillage({ id: +id })
    village.value = new entities.Village(res.Village!)
  }

  useEffect(() => {
    Promise.all([
      updateVillage(),
      server.getTroops({}).then(res => troops.value = res.troops.map(t => new entities.Troop(t))),
    ])
      .then(() => loading.value = false)
      .catch(err => alert(err))
  }, [])

  // TODO: Replace with SSE
  useSignalEffect(() => {
    const intervalId = loading.value ? 0 : setInterval(updateVillage, 1000)

    return () => {
      if (intervalId !== -1) clearInterval(intervalId)
    }
  })

  if (loading.value) {
    return <div>Loading...</div>
  } else {
    return <Village village={village.value!} troops={troops.value!} forceRender={forceRender} />
  }
}

const Village = ({ village, troops, forceRender }: { village: entities.Village, troops: entities.Troop[], forceRender: () => void }) => {
  return (
    <div>
      <h1>Village {village.id}</h1>
      <h2>Resources</h2>
      <ul>
        <li>{village?.gold} Gold</li>
      </ul>
      <VillageBuildings village={village} forceRender={forceRender} />
      <VillageTroops village={village} troops={troops} forceRender={forceRender} />
    </div>
  )
}

const VillageBuildings = ({ village, forceRender }: { village: entities.Village, forceRender: () => void }) => {
  async function cancelBuildingUpgradeOrder(order: entities.BuildingUpgradeOrder) {
    try {
      await server.cancelBuildingUpgradeOrder({ id: order.id })
      village.removeBuildingUpgradeOrder(order.id)
      village.addGold(order.building.upgradeCost().gold)
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
        {village.buildings.map(building => <VillageBuilding village={village} building={building} forceRender={forceRender} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.buildingUpgradeOrders.map(order => {
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

const VillageTroops = ({ village, troops, forceRender }: { village: entities.Village, troops: entities.Troop[], forceRender: () => void }) => {
  function getTroop(kind: entities.TroopKind) {
    return troops.find(t => t.kind == kind)!
  }

  async function cancelTrainingOrder(order: entities.TroopTrainingOrder, troop: entities.Troop) {
    try {
      await server.cancelTroopTrainingOrder({ id: order.id })
      village.removeTroopTrainingOrder(order.id)
      village.addGold(troop.trainCost(order.quantity).gold)
      forceRender()
    } catch (err) {
      alert(`Failed to cancel troop training order (id: ${order.id}): ${err}`)
    }
  }

  return (
    <div>
      <h2>Troops</h2>
      <ul>
        {troops.map(troop => <VillageTroop village={village} troop={troop} forceRender={forceRender} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.troopTrainingOrders.map(order => {
          const troop = getTroop(order.troopKind)
          return (<li>
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(order, troop)}>cancel</button>
          </li>)
        })}
      </ul>
    </div>
  )
}

function VillageTroop({ village, troop, forceRender }: { village: entities.Village, troop: entities.Troop, forceRender: () => void }) {
  async function issueTrainingOrder(troopKind: entities.TroopKind, quantity: number) {
    try {
      const { order } = await server.issueTroopTrainingOrder({ troopKind, quantity, villageId: village.id })
      village.addTroopTrainingOrder(new entities.TroopTrainingOrder(order!, village))
      village.addGold(-order?.cost?.gold!)
      forceRender()
    } catch (err) {
      alert(`Failed to issue troop training order (troopKind: ${troopKind}, quantity: ${quantity}): ${err}`)
    }
  }

  const quantityToTrain = useSignal(1)

  const quantity = village.troopQuantity[troop.kind]
  const max = troop.kind == entities.TroopKind.LEADER ? village.trainableLeaders : undefined
  const quantityInTraining = village.troopTrainingOrders.reduce((acc, order) => {
    return acc + (troop.kind == troop.kind ? order.quantity : 0)
  }, 0)

  const children = []
  switch (village.troopTrainingStatus(troop, quantity)) {
    case entities.TroopTrainingStatus.TRAINABLE:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={max} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button onClick={() => issueTrainingOrder(troop.kind, quantityToTrain.value)}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={max} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button disabled={true}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.MAX_LEADERS:
      break

    default:
      throw new Error(`Unknown village troop train status: ${village.troopTrainingStatus(troop, quantity)}`)
  }

  return <li>
    {troop.name} - {quantity} ({quantityInTraining})
    {children}
  </li>
}