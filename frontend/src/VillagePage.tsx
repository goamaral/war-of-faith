import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'preact/hooks'
import { makeAutoObservable } from "mobx"

import * as serverV1Types from "../lib/protobuf/server/v1/server_pb"
import * as entities from './entities'
import server from './server'

function parseNumber(n: any): number {
  try {
    return parseInt(n)
  } catch {
    return 0
  }
}

export default function VillagePage() {
  const { id } = useParams() as { id: string }

  const [isLoading, setIsLoading] = useState(true)
  const [village, setVillage] = useState<entities.Village>()

  async function updateVillage() {
    const res = await server.getVillage({ id: parseInt(id) })
    const village = new entities.Village(res.Village!)
    makeAutoObservable(village)
    setVillage(village)
  }

  useEffect(() => {
    updateVillage().then(() => setIsLoading(false)).catch(err => alert(err))
  }, [])

  // TODO: Replace with SSE
  useEffect(() => {
    const intervalId = isLoading ? 0 : setInterval(updateVillage, 1000)

    return () => {
      if (intervalId !== -1) clearInterval(intervalId)
    }
  }, [isLoading])

  if (isLoading) {
    return <div>Loading...</div>
  } else {
    return <Village village={village!} />
  }
}

const Village = observer(({ village }: { village: entities.Village }) => {
  return (
    <div>
      <h1>Resources</h1>
      <ul>
        <li>{village?.gold} Gold</li>
      </ul>
      <h1>Village</h1>
      <VillageBuildings village={village!} />
      <VillageTroops village={village} />
    </div>
  )
})

const VillageBuildings = observer(({ village }: { village: entities.Village }) => {  
  function UpgradeStatus({ building }: { building: entities.Building }) {
    async function upgrade() {
      const res = await server.upgradeBuilding({ id: building.id })
      const updatedBuilding = new entities.Building(res.building!)
      village.updateBuilding(updatedBuilding)

      if (updatedBuilding.upgradeStatus != serverV1Types.Building_UpgradeStatus.UPGRADING) {
        alert(`Failed to upgrade ${updatedBuilding.name} (status: ${updatedBuilding.upgradeStatus.toString()})`)
        return
      }
      village.addGold(-building.upgradeCost.gold)
    }

    async function cancelUpgrade() {
      const res = await server.cancelUpgradeBuilding({ id: building.id })
      const updatedBuilding = new entities.Building(res.building!)
      village.updateBuilding(updatedBuilding)
    
      if (updatedBuilding.upgradeStatus != serverV1Types.Building_UpgradeStatus.UPGRADABLE) {
        alert(`Failed to cancel upgrade ${updatedBuilding.name} (status: ${updatedBuilding.upgradeStatus.toString()})`)
        return
      }
      village.addGold(building.upgradeCost.gold)
    }

    switch (building.upgradeStatus) {
      case serverV1Types.Building_UpgradeStatus.UPGRADABLE:
        return <button onClick={upgrade}>upgrade ({building.upgradeCost.time}s, {building.upgradeCost.gold} gold)</button>

      case serverV1Types.Building_UpgradeStatus.UPGRADING:
        return <>
          <button onClick={cancelUpgrade}>cancel</button>
          {building.upgradeTimeLeft}s left
        </>

      case serverV1Types.Building_UpgradeStatus.MAX_LEVEL:
        return <></>

      case serverV1Types.Building_UpgradeStatus.INSUFFICIENT_RESOURCES:
        return <button disabled={true}>upgrade ({building.upgradeCost.time}s, {building.upgradeCost.gold} gold)</button>


      default:
        throw new Error(`Unknown building upgrade status: ${building.upgradeStatus.toString()}`)
    }
  }

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {Array.from(village.buildings.values()).map(building => {
          return (<li>
            {building.name} - level {building.level} <UpgradeStatus building={building} />
          </li>)
        })}
      </ul>
    </div>
  )
})


const VillageTroops = observer(({ village }: { village: entities.Village }) => {
  async function issueTrainingOrder(troop: entities.Troop, quantity: number) {
    try {
      const { order } = await server.issueTroopTrainingOrder({ troopId: troop.id, quantity })
      village.addTroopTrainingOrder(new entities.TroopTrainingOrder(order!, village))
      village.addGold(-troop.trainCost(quantity).gold)
    } catch (err) {
      alert(`Failed to issue troop training order for ${troop.name} (quantity: ${quantity}): ${err}`)
    }
  }

  async function cancelTrainingOrder(order: entities.TroopTrainingOrder) {
    try {
      await server.cancelTroopTrainingOrder({ id: order.id })
      village.removeTroopTrainingOrder(order.id)
      village.addGold(order.troop.trainCost(order.quantity).gold)
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
          <input type="number" value={quantity} min={0} max={max} onChange={e => setQuantity(parseNumber(e.currentTarget.value))} />,
          <button onClick={() => issueTrainingOrder(troop, quantity)}>train ({troop.trainCost(quantity).time}s, {troop.trainCost(quantity).gold} gold)</button>
        )
        break

      case entities.TroopTrainStatus.NOT_ENOUGH_RESOURCES:
        children.push(
          <input type="number" value={quantity} min={0} max={max} onChange={e => setQuantity(parseNumber(e.currentTarget.value))} />,
          <button disabled={true}>train ({troop.trainCost(quantity).time}s, {troop.trainCost(quantity).gold} gold)</button>
        )
        break

      case entities.TroopTrainStatus.NO_MORE_LEADERS:
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
        {Array.from(village.troops.values()).map(troop => <VillageTroop troop={troop} />)}
      </ul>
      <h4>Orders</h4>
      <ul>
          {Array.from(village.troopTrainingOrders.map(order => {
            return (<li>
              {order.quantity} {order.troop.name} - {order.timeLeft}s <button onClick={() => cancelTrainingOrder(order)}>cancel</button>
            </li>)
          }))}
      </ul>
    </div>
  )
})