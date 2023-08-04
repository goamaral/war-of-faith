// import { useNavigate } from 'react-router-dom'
// import { getGridMap } from './engine'
// import { GridMap } from './entities/grid_map'
// import { useEntity } from './hooks'

// export default function GridPagePage() {
//   const navigate = useNavigate()

//   const gridMap = useEntity(getGridMap())

//   function generateGrid() {
//     const rows = []
//     for (let y = 0; y < gridMap.height; y++) {
//       const row = []
//       for (let x = 0; x < gridMap.width; x++) {
//         const village = gridMap.cells.get(GridMap.generateCoords(x, y))
//         const style = {
//           border: '1px solid black',
//           width: '20px',
//           height: '20px',
//           backgroundColor: village ? 'green' : 'white',
//           cursor: village ? 'pointer' : 'initial',
//         }
//         const onClick = () => {
//           if (village) navigate(`/villages/${village.coords}`)
//         }
//         row.push(<div style={style} onClick={onClick}></div>)
//       }
//       rows.push(<div style={{ display: 'flex' }}>{row}</div>)
//     }
//     return <div>{rows}</div>
//   }

//   return (
//     <div>
//       <h1>Map</h1>
//       {generateGrid()}
//     </div>
//   )
// }