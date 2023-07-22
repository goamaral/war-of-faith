import { useNavigate } from 'react-router-dom'
import engine from './engine'
import { GridMap } from './entities/grid_map'

export default function GridPagePage() {
  const navigate = useNavigate()

  function generateGrid() {
    const rows = []
    for (let y = 0; y < engine.map.height; y++) {
      const row = []
      for (let x = 0; x < engine.map.width; x++) {
        const village = engine.map.cells.get(GridMap.generateCoords(x, y))
        const style = {
          border: '1px solid black',
          width: '20px',
          height: '20px',
          backgroundColor: village ? 'green' : 'white',
          cursor: village ? 'pointer' : 'initial',
        }
        const onClick = () => {
          if (village) navigate(`/villages/${village.coords}`)
        }
        row.push(<div style={style} onClick={onClick}></div>)
      }
      rows.push(<div style={{ display: 'flex' }}>{row}</div>)
    }
    return <div>{rows}</div>
  }

  return (
    <div>
      <h1>Map</h1>
      {generateGrid()}
    </div>
  )
}