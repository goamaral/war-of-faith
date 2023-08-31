import { useState, useEffect, useRef } from "preact/hooks"
import { useNavigate } from "react-router-dom" 

import * as serverV1Types from "../lib/protobuf/server/v1/server_pb"
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
  const [openDialogCoords, setOpenDialogCoords] = useState("")

  const rows = []
  for (let y = 0; y < world.height; y++) {
    const row = []
    for (let x = 0; x < world.width; x++) {
      const coords = `${x},${y}`
      const cell = world.cells[coords] || new serverV1Types.World_Cell({ coords, x, y })
      row.push(<WorldCell cell={cell} openDialogCoords={openDialogCoords} setOpenDialogCoords={setOpenDialogCoords} />)
    }
    rows.push(<div style={{ display: 'flex' }}>{row}</div>)
  }
  return <div>{rows}</div>
}


function WorldCell({ cell, openDialogCoords, setOpenDialogCoords }: { cell: serverV1Types.World_Cell, openDialogCoords: string, setOpenDialogCoords: (n: string) => void }) {
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

  function onCellClick() {
    switch (cell.entityKind) {
      case serverV1Types.World_Cell_EntityKind.VILLAGE:
        navigate(`/villages/${cell.entityId}`)
        break

      case serverV1Types.World_Cell_EntityKind.TEMPLE:
        // TODO: Open temple page
        break

      default:
        setOpenDialogCoords(cell.coords)
        break
    }
  }

  function conquer() {
    // TODO: Call server conquer method
    console.log(cell.coords)
  }

  const navigate = useNavigate()
  const dialogRef = useRef<HTMLDivElement>(null)
  const dialogIsOpen = openDialogCoords == cell.coords

  useEffect(() => {
    function onMoundDown(ev: MouseEvent) {
      if (!dialogRef.current?.contains(ev.target as Node) && dialogIsOpen) setOpenDialogCoords("")
    }
    document.addEventListener('mousedown', onMoundDown)
    return () => document.removeEventListener('mousedown', onMoundDown)
  })

  const cellStyle = {
    border: '1px solid black',
    width: '20px',
    height: '20px',
    position: 'relative',
    ...kindStyle(),
  }

  const dialogStyle = {
    position: 'absolute',
    visibility: dialogIsOpen ? 'visible' : 'hidden',
    zIndex: 1,
  }

  return (
    <div style={cellStyle} onClick={onCellClick}>
      <div ref={dialogRef} style={dialogStyle}>
        <button onClick={conquer}>Conquer</button>
      </div>
    </div>
  )
}