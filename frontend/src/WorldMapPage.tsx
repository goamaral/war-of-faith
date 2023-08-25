import { useState, useEffect } from "preact/hooks"
import { useNavigate } from "react-router-dom" 

import * as serverV1Types from "../lib/protobuf/server/v1/server_pb"
import server from './server'
import { JSX } from "preact/jsx-runtime"

function renderWorld(world: serverV1Types.World, onCellClick: (cell: serverV1Types.World_Cell) => void): JSX.Element {
  function cellKindStyles(kind: serverV1Types.World_Cell_EntityKind) {
    switch (kind) {
      case serverV1Types.World_Cell_EntityKind.VILLAGE:
        return { backgroundColor: 'green', cursor: 'pointer' }

      case serverV1Types.World_Cell_EntityKind.TEMPLE:
        return { backgroundColor: 'yellow' }

      default:
        return {}
    }
  }

  const rows = []
  for (let y = 0; y < world.height; y++) {
    const row = []
    for (let x = 0; x < world.width; x++) {
      const cell = world.cells[`${x},${y}`] || new serverV1Types.World_Cell({ x, y })
      const style = {
        border: '1px solid black',
        width: '20px',
        height: '20px',
        ...cellKindStyles(cell.entityKind)
      }
      row.push(<div style={style} onClick={() => onCellClick(cell)}></div>)
    }
    rows.push(<div style={{ display: 'flex' }}>{row}</div>)
  }
  return <div>{rows}</div>
}

export default () => {
  const [loading, setLoading] = useState(true)
  const [world, setWorld] = useState<serverV1Types.World>(new serverV1Types.World())
  const navigate = useNavigate()

  useEffect(() => {
    server.getWorld({ loadCells: true }).then(({ world }) => {
      setWorld(world!)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div>Loading...</div>
  } else {
    return (
      <div>
        <h1>World Map</h1>
        {renderWorld(world, cell => {
          if (cell.entityKind == serverV1Types.World_Cell_EntityKind.VILLAGE) navigate(`/villages/${cell.entityId}`)
        })}
      </div>
    )
  }
}