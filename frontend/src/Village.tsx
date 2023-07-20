import { Village } from './entities/village'
import { useEntity } from './hooks'
import engine from './engine'
import TroopTypeToString, { TroopType } from './entities/troop'

export default function VillagePage() {
  const village = useEntity(
    engine.player.villages[0],
    engine.player.villages[0].buildings.villageHall.getEvent(),
    engine.player.villages[0].buildings.goldMine.getEvent(),
  )

  return (
    <div>
      <h1>Resources</h1>
      <ul>
        <li>{village.resources.gold} Gold</li>
      </ul>
      <h1>Village</h1>
      <VillageBuildings village={village} />
      <Troops village={village} />
    </div>
  )
}

interface VillageBuildingsProps {
  village: Village
}
function VillageBuildings({ village }: VillageBuildingsProps) {
  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {(Object.values(village.buildings)).map(building => {
          return (<li>
            {building.name} - level {building.level} - 
            {
              building.isUpgradable ?
                (
                  building.upgradeTimeLeft === 0 ?
                    <>
                      <button onClick={() => building.upgrade()}>+</button>
                      {building.upgradeCost.gold} gold
                    </>
                    :
                    <>
                      <button onClick={() => building.cancelUpgrade()}>cancel</button>
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

interface TroopsProps {
  village: Village,
}
function Troops({ village }: TroopsProps) {
  const villageHall = village.buildings.villageHall

  return (
    <div>
      <h2>Troops</h2>
      <ul>
        <li>
          {TroopTypeToString(TroopType.Leader)} - {villageHall.leaders}
          {
            villageHall.canTrainLeader ?
              (
                villageHall.leaderTrainTimeLeft === 0 ?
                  <>
                    <button onClick={() => villageHall.trainLeader()}>+</button>
                    {villageHall.leaderTrainCost.gold} gold
                  </>
                :
                  <>
                    <button onClick={() => villageHall.cancelTrainLeader()}>cancel</button>
                    {villageHall.leaderTrainTimeLeft}s left
                  </>
              )
              :
              null
          }
        </li>
      </ul>
    </div>
  )
}