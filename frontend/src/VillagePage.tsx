import { useParams } from 'react-router-dom'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { create } from 'zustand'

import * as serverV1 from "../lib/protobuf/server/v1/server_pb"
import * as entities from './entities'
import server from './server'

interface Store {
  village: entities.Village
  buildings: entities.Building[],
  troops: entities.Troop[],
  trainableLeaders: number,
  load: (villageId: number) => Promise<void>
  consumeVillageEvent: (event: serverV1.Village_Event) => void
  consumePlayerEvent: (event: serverV1.Player) => void
  cancelBuildingUpgradeOrder: (order: serverV1.Building_UpgradeOrder) => Promise<void>
  issueUpgradeOrder: (building: entities.Building) => Promise<void>
  cancelTrainingOrder: (order: serverV1.Troop_TrainingOrder) => Promise<void>
  issueTrainingOrder: (troopKind: entities.TroopKind, quantity: number) => Promise<void>
}

const useStore = create<Store>((set, get) => ({
  village: new entities.Village(),
  buildings: [],
  troops: [],
  trainableLeaders: 0,

  async load(villageId: number) {
    const results = await Promise.all([
      server.getVillage({ id: villageId }),
      server.getBuildings({}),
      server.getTroops({}),
      server.getPlayer({}),
    ])

    set({
      village: new entities.Village(results[0].village),
      buildings: results[1].buildings.map(b => new entities.Building(b)),
      troops: results[2].troops.map(t => new entities.Troop(t)),
      trainableLeaders: results[3].player!.trainableLeaders,
    })
  },

  consumeVillageEvent(event: serverV1.Village_Event) {
    console.debug("New village event", event)
    if (event.action == serverV1.Village_Event_Action.UPDATE) {
      set({ village: new entities.Village(event.village!) })
    } else {
      alert("Action not supported")
    }
  },

  consumePlayerEvent(player: serverV1.Player) {
    console.debug("New player event", player)
    set({ trainableLeaders: player.trainableLeaders })
  },

  async cancelBuildingUpgradeOrder(order: serverV1.Building_UpgradeOrder) {
    try {
      const village = get().village
      await server.cancelBuildingUpgradeOrder({ id: order.id })
      village.removeBuildingUpgradeOrder(order.id)
      village.addGold(order.cost!.gold)
      set({ village: new entities.Village(village) })
    } catch(err) {
      alert(`Failed to cancel building upgrade order (id: ${order.id}): ${err}`)
    }
  },

  async issueUpgradeOrder(building: entities.Building) {
    try {
      const village = get().village
      const { order } = await server.issueBuildingUpgradeOrder({ buildingKind: building.kind, villageId: village.id })
      village.addBuildingUpgradeOrder(order!)
      village.addGold(-order!.cost!.gold!)
      set({ village: new entities.Village(village) })
    } catch (err) {
      alert(`Failed to issue building upgrade order for ${building.name}: ${err}`)
    }
  },

  async cancelTrainingOrder(order: serverV1.Troop_TrainingOrder) {
    try {
      const { village, trainableLeaders } = get()
      await server.cancelTroopTrainingOrder({ id: order.id })
      village.removeTroopTrainingOrder(order.id)
      village.addGold(order.cost!.gold)

      set({
        village: new entities.Village(village), 
        trainableLeaders: order.troopKind == entities.TroopKind.LEADER ? trainableLeaders + 1 : trainableLeaders,
      })
    } catch (err) {
      alert(`Failed to cancel troop training order (id: ${order.id}): ${err}`)
    }
  },

  async issueTrainingOrder(troopKind: entities.TroopKind, quantity: number) {
    try {
      const { village, trainableLeaders } = get()
      const { order } = await server.issueTroopTrainingOrder({ troopKind, quantity, villageId: village.id })
      village.addTroopTrainingOrder(order!)
      village.addGold(-order?.cost?.gold!)

      set({
        village: new entities.Village(village),
        trainableLeaders: troopKind == entities.TroopKind.LEADER ? trainableLeaders - 1 : trainableLeaders,
      })
    } catch (err) {
      alert(`Failed to issue troop training order (troopKind: ${troopKind}, quantity: ${quantity}): ${err}`)
    }
  }
}))

export default () => <VillageLoader />

const VillageLoader = () => {
  const { id } = useParams() as { id: string }
  const loaded = useSignal(false)
  const load = useStore(state => state.load)
  useEffect(() => {
    load(+id)
      .then(() => loaded.value = true)
      .catch(err => alert(err))
  }, [])

  if (!loaded.value) return <div>Loading...</div>

  const consumeVillageEvent = useStore(state => state.consumeVillageEvent)
  const consumePlayerEvent = useStore(state => state.consumePlayerEvent)

  useEffect(() => {
    const villagesStream = server.subscribeToVillages({ ids: [+id] })
    async function subscribeToVillages() {
      try {
        
        for await (const villageEvent of villagesStream) consumeVillageEvent(villageEvent)
      } catch (err) {
        console.error(err)
        subscribeToVillages()
      }
    }
    subscribeToVillages()
  }, [])

  useEffect(() => {
    const playerStream = server.subscribeToPlayer({})
    async function subscribeToPlayer() {
      try {
        for await (const playerEvent of playerStream) consumePlayerEvent(playerEvent)
      } catch (err) {
        console.error(err)
        subscribeToPlayer()
      }
    }
    subscribeToPlayer()
  }, [])

  return <Village />
}

const Village = () => {
  const village = useStore(store => store.village)

  return (
    <div>
      <h1>{village.name}</h1>
      <h2>Resources</h2>
      <ul>
        <li>{village.resources!.gold} Gold</li>
      </ul>
      <VillageBuildings />
      <VillageTroops />
    </div>
  )
}

const VillageBuildings = () => {
  function orderCancelable(order: serverV1.Building_UpgradeOrder): boolean {
    const orders = village.buildingUpgradeOrders
    const index = orders.findIndex(o => o.id === order.id)
    return index == orders.length - 1
  }

  const village = useStore(store => store.village)
  const buildings = useStore(store => store.buildings)
  const cancelBuildingUpgradeOrder = useStore(store => store.cancelBuildingUpgradeOrder)

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {buildings.map(building => <VillageBuilding building={building} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.buildingUpgradeOrders.map(order => {
          const building = buildings.find(b => b.kind == order.buildingKind)!
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
  const village = useStore(store => store.village)
  const issueUpgradeOrder = useStore(store => store.issueUpgradeOrder)

  const level = village.buildingLevel[building.kind]
  const nextLevel = village.getBuildingNextLevel(building.kind)
  const upgradeCost = building.upgradeCost(nextLevel)
  const upgradeStatus = village.getBuildingUpgradeStatus(building)

  const children = []
  switch (upgradeStatus) {
    case entities.BuildingUpgradeStatus.UPGRADABLE:
      children.push(
        <button onClick={() => issueUpgradeOrder(building)}>upgrade (lvl {nextLevel}, {upgradeCost.time}s, {upgradeCost.gold} gold)</button>
      )
      break

    case entities.BuildingUpgradeStatus.MAX_LEVEL:
      break

    case entities.BuildingUpgradeStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <button disabled={true}>upgrade (lvl {nextLevel}, {upgradeCost.time}s, {upgradeCost.gold} gold)</button>
      )
      break

    default:
      throw new Error(`Unknown building upgrade status: ${upgradeStatus}`)
  }

  return <li>
    {building.name} - lvl {level}
    {children}
  </li>
}

const VillageTroops = () => {
  const village = useStore(store => store.village)
  const troops = useStore(store => store.troops)
  const cancelTrainingOrder = useStore(store => store.cancelTrainingOrder)

  return (
    <div>
      <h2>Troops</h2>
      <ul>
        {troops.map(troop => <VillageTroop troop={troop} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.troopTrainingOrders.map(order => {
          const troop = troops.find(t => t.kind == order.troopKind)!
          return (<li>
            {order.quantity} {troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(order)}>cancel</button>
          </li>)
        })}
      </ul>
    </div>
  )
}

function VillageTroop({ troop }: { troop: entities.Troop }) {
  const village = useStore(store => store.village)
  const trainableLeaders = useStore(store => store.trainableLeaders)
  const issueTrainingOrder = useStore(store => store.issueTrainingOrder)

  const quantityToTrain = useSignal(1)

  const quantity = village.troopQuantity[troop.kind] ?? 0
  const quantityInTraining = village.troopTrainingOrders.reduce((acc, order) => {
    return acc + (troop.kind == troop.kind ? order.quantity : 0)
  }, 0)
  const trainableTroops = troop.kind == entities.TroopKind.LEADER ? trainableLeaders : undefined
  const trainingStatus = village.getTroopTrainingStatus(troop, quantityToTrain.value, trainableTroops)

  const children = []
  switch (trainingStatus) {
    case entities.TroopTrainingStatus.TRAINABLE:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={trainableTroops} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button onClick={() => issueTrainingOrder(troop.kind as entities.TroopKind, quantityToTrain.value)}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.INSUFFICIENT_RESOURCES:
      children.push(
        <input type="number" value={quantityToTrain} min={0} max={trainableTroops} onChange={e => quantityToTrain.value = +e.currentTarget.value} />,
        <button disabled={true}>train ({troop.trainCost(quantityToTrain.value).time}s, {troop.trainCost(quantityToTrain.value).gold} gold)</button>
      )
      break

    case entities.TroopTrainingStatus.MAX_TRAINABLE:
      break

    default:
      throw new Error(`Unknown village troop train status: ${trainingStatus}`)
  }

  return <li>
    {troop.name} - {quantity} ({quantityInTraining})
    {children}
  </li>
}