import { BuildingMap, TroopMap } from './entities/village'
import { useVillage } from './hooks'
import engine from './engine'

export default function Village() {
  const village = useVillage(engine.player.village)

  return (
    <div>
      <h1>Gold {village.resources.gold}</h1>
      <h1>Village</h1>
      <Buildings buildings={village.buildings} />
      <Troops troops={village.troops} />
    </div>
  )
}

interface BuildingsProps {
  buildings: BuildingMap
}
function Buildings({ buildings }: BuildingsProps) {
  return (
    <div>
      <h2>Buildings</h2>
      <ul>
        {(Object.values(buildings)).map(building => {
          return (<li>{building.name} - level {building.level} <button onClick={building.levelUp.bind(building)}>+</button></li>)
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
          return (<li>{troopId} - {troops[troopId]}</li>)
        })}
      </ul>
    </div>
  )
}