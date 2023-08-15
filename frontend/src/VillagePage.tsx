import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react'
import { useEffect, useState } from 'preact/hooks'

import * as serverV1Types from "../lib/protobuf/server/v1/server_pb"
import * as entities from './entities'
import server from './server'
// import TroopTypeToString, { TroopType } from './entities/troop'

export default function VillagePage() {
  const { id } = useParams() as { id: string }

  const [isLoading, setIsLoading] = useState(true)
  const [village, setVillage] = useState<entities.Village>()

  async function updateVillage() {
    const res = await server.getVillage({ id: parseInt(id) })
    setVillage(new entities.Village(res.Village!))
  }

  useEffect(() => {
    updateVillage().then(() => setIsLoading(false))
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
      {/* <Troops village={village} /> */}
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
        alert(`Failed to upgrade ${updatedBuilding.name} (status: ${updatedBuilding.upgradeStatus})`)
        return
      }
      village.gold -= building.upgradeCost.gold
    }

    async function cancelUpgrade() {
      const res = await server.cancelUpgradeBuilding({ id: building.id })
      const updatedBuilding = new entities.Building(res.building!)
      village.updateBuilding(updatedBuilding)
    
      if (updatedBuilding.upgradeStatus != serverV1Types.Building_UpgradeStatus.UPGRADABLE) {
        alert(`Failed to cancel upgrade ${updatedBuilding.name} (status: ${updatedBuilding.upgradeStatus})`)
        return
      }
      village.gold += building.upgradeCost.gold
    }

    switch (building.upgradeStatus) {
      case serverV1Types.Building_UpgradeStatus.UPGRADABLE:
        return <>
          <button onClick={upgrade}>+</button>
          {building.upgradeCost.gold} gold
        </>

      case serverV1Types.Building_UpgradeStatus.UPGRADING:
        return <>
          <button onClick={cancelUpgrade}>cancel</button>
          {building.upgradeTimeLeft}s left
        </>

      case serverV1Types.Building_UpgradeStatus.MAX_LEVEL:
        return <></>

      case serverV1Types.Building_UpgradeStatus.INSUFFICIENT_RESOURCES:
        return <>
          <button disabled={true}>+</button>
          {building.upgradeCost.gold} gold
        </>

      default:
        throw new Error(`Unknown upgrade status: ${building.upgradeStatus}`)
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

// interface TroopsProps {
//   village: Village,
// }
// function Troops({ village }: TroopsProps) {
//   const villageHall = village.buildings.villageHall

//   return (
//     <div>
//       <h2>Troops</h2>
//       <ul>
//         <li>
//           {TroopTypeToString(TroopType.Leader)} - {villageHall.leaders}
//           {
//             villageHall.canTrainLeader ?
//               (
//                 villageHall.leaderTrainTimeLeft === 0 ?
//                   <>
//                     <button onClick={() => villageHall.trainLeader()}>+</button>
//                     {villageHall.leaderTrainCost.gold} gold
//                   </>
//                 :
//                   <>
//                     <button onClick={() => villageHall.cancelTrainLeader()}>cancel</button>
//                     {villageHall.leaderTrainTimeLeft}s left
//                   </>
//               )
//               :
//               null
//           }
//         </li>
//       </ul>
//     </div>
//   )
// }