import { TroopMap, Village } from './entities/village'
import { useVillage } from './hooks'
import engine from './engine'

export default function VillagePage() {
  const village = useVillage(engine.player.village)

  return (
    <div>
      <h1>Resources</h1>
      <ul>
        <li>{village.resources.gold} Gold</li>
      </ul>
      <h1>Village</h1>
      <VillageBuildings village={village} />
      <Troops troops={village.troops} />
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
              building.upgradeTimeLeft === 0 ?
                <>
                  <button onClick={() => village.upgradeBuilding(building.type)}>+</button>
                  {building.upgradeCost} gold
                </>
                :
                <>
                  <button onClick={() => village.cancelBuildingUpgrade(building.type)}>cancel</button>
                  {building.upgradeTimeLeft}s left
                </>
            }
          </li>)
        })}
      </ul>
    </div>
  )
}

interface TroopsProps {
  troops: TroopMap
}
function Troops({ troops }: TroopsProps) {
  return (
    <div>
      <h2>Troops</h2>
      <ul>
        {(Object.keys(troops)).map(troopId => {
          return (<li>{troops[troopId]} {troopId}</li>)
        })}
      </ul>
    </div>
  )
}