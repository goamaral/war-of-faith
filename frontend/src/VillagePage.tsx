import { useParams } from 'react-router-dom'
import { useContext, useEffect } from 'preact/hooks'
import { useComputed, useSignal, useSignalEffect, signal } from '@preact/signals'
import { createContext } from 'preact'

import * as serverV1 from "../lib/protobuf/server/v1/server_pb"
import * as entities from './entities'
import server from './server'

function createVillageState() {
  const village = signal<entities.Village>(new entities.Village(new serverV1.Village()))
  const buildings = signal<entities.Building[]>([])
  const troops = signal<entities.Troop[]>([])
  const trainableLeaders = signal<number>(0)

  return { village, buildings, troops, trainableLeaders }
}

const VillageContext = createContext(createVillageState())

export default () => {
  return <VillageContext.Provider value={createVillageState()}>
    <VillageLoader />
  </VillageContext.Provider>
}

const VillageLoader = () => {
  const { id } = useParams() as { id: string }

  const loading = useSignal(true)
  const { village, buildings, troops, trainableLeaders } = useContext(VillageContext)

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
      server.getBuildings({}).then(res => buildings.value = res.buildings.map(b => new entities.Building(b))),
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
    return <Village />
  }
}

const Village = () => {
  const { village } = useContext(VillageContext)

  return (
    <div>
      <h1>{village.value.name}</h1>
      <h2>Resources</h2>
      <ul>
        <li>{village.value.resources!.gold} Gold</li>
      </ul>
      <VillageBuildings />
      <VillageTroops />
    </div>
  )
}

const VillageBuildings = () => {
  async function cancelBuildingUpgradeOrder(order: serverV1.Building_UpgradeOrder) {
    try {
      const v = village.peek()
      await server.cancelBuildingUpgradeOrder({ id: order.id })
      v.removeBuildingUpgradeOrder(order.id)
      v.addGold(order.cost!.gold)
      village.value = new entities.Village(v)
    } catch (err) {
      alert(`Failed to cancel building upgrade order (id: ${order.id}): ${err}`)
    }
  }

  function orderCancelable(order: serverV1.Building_UpgradeOrder): boolean {
    const orders = village.peek().buildingUpgradeOrders
    const index = orders.findIndex(o => o.id === order.id)
    return index == orders.length - 1
  }

  const { village, buildings } = useContext(VillageContext)

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {buildings.value.map(building => <VillageBuilding building={building} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.value.buildingUpgradeOrders.map(order => {
          const building = buildings.peek().find(b => b.kind == order.buildingKind)!
          return (<li>
            {building.name} (lvl {order.level}) - {order.timeLeft}s {
              orderCancelable(order) ? <button onClick={() => cancelBuildingUpgradeOrder(order)}>cancel</button> : <></>
            }
          </li>)
        })}
      </ul>
    </div>
  )
}

function VillageBuilding({ building }: { building: entities.Building }) {
  async function issueUpgradeOrder(building: entities.Building) {
    try {
      const v = village.peek()
      const { order } = await server.issueBuildingUpgradeOrder({ buildingKind: building.kind, villageId: v.id })
      v.addBuildingUpgradeOrder(order!)
      v.addGold(-order!.cost!.gold!)
      village.value = new entities.Village(v)
    } catch (err) {
      alert(`Failed to issue building upgrade order for ${building.name}: ${err}`)
    }
  }

  const { village } = useContext(VillageContext)
  const level = useComputed(() => village.value.buildingLevel[building.kind])
  
  const nextLevel = useComputed(() => village.value.getBuildingNextLevel(building.kind))
  const upgradeCost = useComputed(() => building.upgradeCost(nextLevel.value))
  const upgradeStatus = useComputed(() => village.value.getBuildingUpgradeStatus(building))

  const children = []
  switch (upgradeStatus.value) {
    case entities.BuildingUpgradeStatus.UPGRADABLE:
      children.push(
        <button onClick={() => issueUpgradeOrder(building)}>upgrade (lvl {nextLevel}, {upgradeCost.value.time}s, {upgradeCost.value.gold} gold)</button>
      )
      break

    case entities.BuildingUpgradeStatus.MAX_LEVEL:
      break

    case entities.BuildingUpgradeStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <button disabled={true}>upgrade (lvl {nextLevel}, {upgradeCost.value.time}s, {upgradeCost.value.gold} gold)</button>
      )
      break

    default:
      throw new Error(`Unknown building upgrade status: ${upgradeStatus.peek()}`)
  }

  return <li>
    {building.name} - lvl {level}
    {children}
  </li>
}

const VillageTroops = () => {
  async function cancelTrainingOrder(order: serverV1.Troop_TrainingOrder) {
    try {
      const v = village.peek()
      await server.cancelTroopTrainingOrder({ id: order.id })
      v.removeTroopTrainingOrder(order.id)
      v.addGold(order.cost!.gold)
      village.value = new entities.Village(v)
      if (order.troopKind == entities.TroopKind.LEADER) trainableLeaders.value += 1
    } catch (err) {
      alert(`Failed to cancel troop training order (id: ${order.id}): ${err}`)
    }
  }

  const { village, troops, trainableLeaders } = useContext(VillageContext)

  return (
    <div>
      <h2>Troops</h2>
      <ul>
        {troops.value.map(troop => <VillageTroop troop={troop} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.value.troopTrainingOrders.map(order => {
          const troop = troops.peek().find(t => t.kind == order.troopKind)!
          return (<li>
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(order)}>cancel</button>
          </li>)
        })}
      </ul>
    </div>
  )
}

function VillageTroop({ troop }: { troop: entities.Troop }) {
  async function issueTrainingOrder(troopKind: entities.TroopKind, quantity: number) {
    try {
      const v = village.peek()
      const { order } = await server.issueTroopTrainingOrder({ troopKind, quantity, villageId: v.id })
      v.addTroopTrainingOrder(order!)
      v.addGold(-order?.cost?.gold!)
      village.value = new entities.Village(v)
      if (troopKind == entities.TroopKind.LEADER) trainableLeaders.value -= 1
    } catch (err) {
      alert(`Failed to issue troop training order (troopKind: ${troopKind}, quantity: ${quantity}): ${err}`)
    }
  }

  const quantityToTrain = useSignal(1)

  const { village, trainableLeaders } = useContext(VillageContext)
  const quantity = useComputed(() => village.value.troopQuantity[troop.kind] ?? 0)
  const quantityInTraining = useComputed(() => village.value.troopTrainingOrders.reduce((acc, order) => {
    return acc + (troop.kind == troop.kind ? order.quantity : 0)
  }, 0))
  const trainableTroops = useComputed(() => troop.kind == entities.TroopKind.LEADER ? trainableLeaders.value : undefined)
  const trainingStatus = useComputed(() => village.value.getTroopTrainingStatus(troop, quantityToTrain.value, trainableTroops.value))

  const children = []
  switch (trainingStatus.value) {
    case entities.TroopTrainingStatus.TRAINABLE:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={trainableTroops.value} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button onClick={() => issueTrainingOrder(troop.kind as entities.TroopKind, quantityToTrain.value)}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={trainableTroops.value} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button disabled={true}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.MAX_TRAINABLE:
      break

    default:
      throw new Error(`Unknown village troop train status: ${trainingStatus.peek()}`)
  }

  return <li>
    {troop.name} - {quantity} ({quantityInTraining})
    {children}
  </li>
}