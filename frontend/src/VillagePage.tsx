import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'preact/hooks'

import * as serverV1Types from "../lib/protobuf/server/v1/server_pb"
import * as entities from './entities'
import server from './server'

function useForceRender() {
  const [state, setState] = useState(true)
  return () => setState(!state)
}

export default () => {
  const { id } = useParams() as { id: string }

  const [loading, setLoading] = useState(true)
  const [village, setVillage] = useState<entities.Village>()
  const forceRender = useForceRender()

  async function updateVillage() {
    const res = await server.getVillage({ id: +id })
    const village = new entities.Village(res.Village!)
    setVillage(village)
  }

  useEffect(() => {
    updateVillage().then(() => setLoading(false)).catch(err => alert(err))
  }, [])

  // TODO: Replace with SSE
  useEffect(() => {
    const intervalId = loading ? 0 : setInterval(updateVillage, 1000)

    return () => {
      if (intervalId !== -1) clearInterval(intervalId)
    }
  }, [loading])

  if (loading) {
    return <div>Loading...</div>
  } else {
    return <Village village={village!} forceRender={forceRender} />
  }
}

const Village = ({ village, forceRender }: { village: entities.Village, forceRender: () => void }) => {
  return (
    <div>
      <h1>Resources</h1>
      <ul>
        <li>{village?.gold} Gold</li>
      </ul>
      <h1>Village</h1>
      <VillageBuildings village={village} forceRender={forceRender} />
      <VillageTroops village={village} forceRender={forceRender} />
    </div>
  )
}

const VillageBuildings = ({ village, forceRender }: { village: entities.Village, forceRender: () => void }) => {
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
  
  function VillageBuilding({ building }: { building: entities.Building }) {
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

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {village.buildings.map(building => <VillageBuilding building={building} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
        {village.buildingUpgradeOrders.map(order => {
          return (<li>
            {order.building.name} (lvl {order.level}) - {order.timeLeft}s {
              orderCancelable(order) ?  <button onClick={() => cancelBuildingUpgradeOrder(order)}>cancel</button> : <></>
            }
          </li>)
        })}
      </ul>
    </div>
  )
}

const VillageTroops = ({ village, forceRender }: { village: entities.Village, forceRender: () => void }) => {
  async function issueTrainingOrder(troop: entities.Troop, quantity: number) {
    try {
      const { order } = await server.issueTroopTrainingOrder({ troopId: troop.id, quantity })
      village.addTroopTrainingOrder(new entities.TroopTrainingOrder(order!, village))
      village.addGold(-order?.cost?.gold!)
      forceRender()
    } catch (err) {
      alert(`Failed to issue troop training order for ${troop.name} (quantity: ${quantity}): ${err}`)
    }
  }

  async function cancelTrainingOrder(order: entities.TroopTrainingOrder) {
    try {
      await server.cancelTroopTrainingOrder({ id: order.id })
      village.removeTroopTrainingOrder(order.id)
      village.addGold(order.troop.trainCost(order.quantity).gold)
      forceRender()
    } catch (err) {
      alert(`Failed to cancel troop training order (id: ${order.id}): ${err}`)
    }
  }

  function VillageTroop({ troop }: { troop: entities.Troop }) {
    const [quantity, setQuantity] = useState(1)

    const max = troop.kind == serverV1Types.Troop_Kind.LEADER ? village.trainableLeaders : undefined
    const quantityTraining = village.troopTrainingOrders.reduce((acc, order) => {
      return acc + (order.troop.id == troop.id ? order.quantity : 0)
    }, 0)

    const children = []
    switch (troop.trainStatus(quantity)) {
      case entities.TroopTrainStatus.TRAINABLE:
        children.push(
          <input type="number" value={quantity} min={0} max={max} onChange={e => setQuantity(+e.currentTarget.value)} />,
          <button onClick={() => issueTrainingOrder(troop, quantity)}>train ({troop.trainCost(quantity).time}s, {troop.trainCost(quantity).gold} gold)</button>
        )
        break

      case entities.TroopTrainStatus.INSUFFICIENT_RESOURCES:
        children.push(
          <input type="number" value={quantity} min={0} max={max} onChange={e => setQuantity(+e.currentTarget.value)} />,
          <button disabled={true}>train ({troop.trainCost(quantity).time}s, {troop.trainCost(quantity).gold} gold)</button>
        )
        break

      case entities.TroopTrainStatus.MAX_LEADERS:
        break

      default:
        throw new Error(`Unknown village troop train status: ${troop.trainStatus(quantity).toString()}`)
    }

    return <li>
      {troop.name} - {troop.quantity} ({quantityTraining})
      {children}
    </li>
  }

  return (
    <div>
      <h2>Troops</h2>
      <ul>
        {village.troops.map(troop => <VillageTroop troop={troop} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
          {village.troopTrainingOrders.map(order => {
            return (<li>
              {order.quantity} {order.troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(order)}>cancel</button>
            </li>)
          })}
      </ul>
    </div>
  )
}