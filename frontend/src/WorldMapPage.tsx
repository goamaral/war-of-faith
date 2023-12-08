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

  const cells = Array(world.width).fill(undefined)
  cells.forEach((_, y) => {
    cells[y] = Array(world.height).fill(undefined).map((_, x) => new serverV1Types.World_Cell({ coords: { x, y } }))
  })
  world.cells.forEach(cell => {
    cells[cell.coords!.y][cell.coords!.x] = cell
  })

  return <div style={{ display: 'flex' }}>
    <div style={gridStyle}>{cells.flat().map(cell => <Cell cell={cell} selectedCell={selectedCell} />)}</div>
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
    async function attack() {
      try {
        const { Village: village } = await server.getVillage({ id: 1 }) // TODO: Get current village

        await server.attack({
          attack: new serverV1Types.Attack({
            villageId: village!.id,
            targetCoords: cell.coords,
            troops: village!.troops,
          }),
        })

        navigate(0)
      } catch (err) {
        alert(`Failed to attack world cell (coords: ${cell.coords}): ${err}`)
      }
    }

    function Actions() {
      switch (cell.entityKind) {
        case serverV1Types.World_Cell_EntityKind.UNSPECIFIED:
          return <button onClick={attack}>Attack</button>

        default:
          return null
      }
    }

    const navigate = useNavigate()

    return (<>
      <h2>{entityKindName}</h2>
      <p><span>Coords</span> {cell.coords!.x}, {cell.coords!.y}</p>
      <Actions />
    </>)
  }

  return <div>
    {selectedCell.value ? <Info cell={selectedCell.value} /> : <h2>No field selected</h2>}
  </div>
}