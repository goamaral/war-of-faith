import { useParams } from 'react-router-dom'
import { observer } from 'mobx-react'

import { Village } from './entities/village'
import { Building } from './entities/building'
import server from './server'
import { useEffect, useState } from 'preact/hooks'
// import TroopTypeToString, { TroopType } from './entities/troop'

export default function VillagePage() {
  const { id } = useParams() as { id: string }

  const [isLoading, setIsLoading] = useState(true)
  const [village, setVillage] = useState<Village>()

  async function updateVillage() {
    const res = await server.getVillage({ id: parseInt(id) })
    setVillage(new Village(res.Village!))
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
  }
}

const VillageBuildings = observer(({ village }: { village: Village }) => {  
  async function upgrade(b: Building) {
    const { building, upgraded } = await server.upgradeBuilding({ villageId: b.villageId, kind: b.kind })
    if (!upgraded) alert(`Failed to upgrade ${b.name}`)
    village.updateBuilding(new Building(building!))
  }

  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {Array.from(village.buildings.values()).map(building => {
          return (<li>
            {building.name} - level {building.level} - 
            {
              building.isUpgradable ?
                (
                  building.upgradeTimeLeft === 0 ?
                    <>
                      <button onClick={() => upgrade(building)}>+</button>
                      {building.upgradeCost.gold} gold
                    </>
                    :
                    <>
                      <button onClick={() => {}/*building.cancelUpgrade()*/}>cancel</button>
                      {building.upgradeTimeLeft}s left
                    </>
                )
                :
                null
            }
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