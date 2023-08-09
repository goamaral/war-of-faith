import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getVillage } from '../lib/protobuf/server/v1/server-Service_connectquery'
import { Village } from './entities/village'
// import TroopTypeToString, { TroopType } from './entities/troop'

export default function VillagePage() {
  const { coords } = useParams() as { coords: string }
  const { data: getVillageResponse, isLoading } = useQuery(getVillage.useQuery({ coords }))

  if (isLoading) {
    return <div>Loading...</div>
  } else {
    const village = new Village(getVillageResponse?.Village!)

    return (
      <div>
        <h1>Resources</h1>
        <ul>
          <li>{village.gold} Gold</li>
        </ul>
        <h1>Village</h1>
        <VillageBuildings village={village} />
        {/* <Troops village={village} /> */}
      </div>
    )
  }
}

function VillageBuildings({ village }: { village: Village }) {
  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {village.buildings.map(building => {
          return (<li>
            {building.name} - level {building.level} - 
            {
              building.isUpgradable ?
                (
                  building.upgradeTimeLeft === 0 ?
                    <>
                      <button onClick={() => {}/*building.upgrade()*/}>+</button>
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
}

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