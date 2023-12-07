import { useState, useEffect } from 'preact/hooks'
import { useSignal, Signal, useComputed } from '@preact/signals';
import { useNavigate } from 'react-router-dom' 

import * as serverV1Types from '../lib/protobuf/server/v1/server_pb'
import server from './server'

export default () => {
  const [loading, setLoading] = useState(true)
  const [world, setWorld] = useState<serverV1Types.World>(new serverV1Types.World())

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
        <World world={world} />
      </div>
    )
  }
}

function World({ world }: { world: serverV1Types.World }) {
  const selectedCell = useSignal<serverV1Types.World_Cell|undefined>(undefined)

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${world.width}, 20px)`,
    gridTemplateRows: `repeat(${world.height}, 20px)`,
    width: 'fit-content',
    borderBottom: '1px solid black',
    borderRight: '1px solid black',
  }

  const cells = []
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const coords = `${x},${y}`
      const cell = world.cells[coords] || new serverV1Types.World_Cell({ coords, x, y })
      cells.push(<Cell cell={cell} selectedCell={selectedCell} />)
    }
  }

  return <div style={{ display: 'flex' }}>
    <div style={gridStyle}>{cells}</div>
    <CellInfo selectedCell={selectedCell} />
  </div>
}


function Cell({ cell, selectedCell }: { cell: serverV1Types.World_Cell, selectedCell: Signal<serverV1Types.World_Cell | undefined> }) {
  function kindStyle() {
    switch (cell.entityKind) {
      case serverV1Types.World_Cell_EntityKind.VILLAGE:
        return { backgroundColor: 'green', cursor: 'pointer' }

      case serverV1Types.World_Cell_EntityKind.TEMPLE:
        return { backgroundColor: 'yellow' }

      default:
        return {}
    }
  }

  function onCellDblClick() {
    switch (cell.entityKind) {
      case serverV1Types.World_Cell_EntityKind.VILLAGE:
        navigate(`/villages/${cell.entityId}`)
        break

      case serverV1Types.World_Cell_EntityKind.TEMPLE:
        alert('TODO: Open temple page')
        break
    }
  }

  const navigate = useNavigate()

  const cellStyle = {
    position: 'relative',
    borderTop: '1px solid black',
    borderLeft: '1px solid black',
    ...kindStyle(),
  }

  return (
    <div style={cellStyle} onClick={() => selectedCell.value = cell} onDblClick={onCellDblClick}></div>
  )
}

function CellInfo({ selectedCell }: { selectedCell: Signal<serverV1Types.World_Cell | undefined> }) {
  const entityKindName = useComputed(() => {
    switch (selectedCell.value?.entityKind) {
      case serverV1Types.World_Cell_EntityKind.VILLAGE:
        return 'Village'

      case serverV1Types.World_Cell_EntityKind.TEMPLE:
        return 'Temple'

      default:
        return 'Wild Field'
    }
  })

  function Info({ cell }: { cell: serverV1Types.World_Cell }) {
    function conquer() {
      alert('TODO: Call server conquer method')
    }

    function Actions() {
      switch (cell.entityKind) {
        case serverV1Types.World_Cell_EntityKind.VILLAGE:
          return <button onClick={conquer}>Conquer</button>

        default:
          return null
      }
    }

    return (<>
      <h2>{entityKindName}</h2>
      <p><span>Coords</span> {cell.coords}</p>
      <Actions />
    </>)
  }

  return <div>
    {selectedCell.value ? <Info cell={selectedCell.value} /> : <h2>No field selected</h2>}
  </div>
}