import engine from './engine'
import { GridMap } from './entities/grid_map'

function generateGrid() {
  const rows = []
  for (let y = 0; y < engine.map.height; y++) {
    const row = []
    for (let x = 0; x < engine.map.width; x++) {
      const cell = engine.map.cells.get(GridMap.generateCoord(x, y))
      row.push(<div style={{ border: '1px solid black', width: '20px', height: '20px', backgroundColor: cell ? 'green' : 'white' }}></div>)
    }
    rows.push(<div style={{ display: 'flex' }}>{row}</div>)
  }
  return <div>{rows}</div>
}

export default function GridPagePage() {
  return (
    <div>
      <h1>Map</h1>
      {generateGrid()}
    </div>
  )
}