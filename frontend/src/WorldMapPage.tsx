import { useState, useEffect } from 'preact/hooks'
import { useSignal, Signal, useComputed } from '@preact/signals';
import { useNavigate } from 'react-router-dom' 

import * as serverV1Types from '../lib/protobuf/server/v1/server_pb'
import server from './server'

export default () => {
  const [loading, setLoading] = useState(true)
  const [world, setWorld] = useState<serverV1Types.World>(new serverV1Types.World())

  useEffect(() => {
    server.getWorld({ loadFields: true }).then(({ world }) => {
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
  const selectedField = useSignal<serverV1Types.World_Field | undefined>(undefined)

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${world.width}, 20px)`,
    gridTemplateRows: `repeat(${world.height}, 20px)`,
    width: 'fit-content',
    borderBottom: '1px solid black',
    borderRight: '1px solid black',
  }

  const fields = Array(world.width).fill(undefined)
  fields.forEach((_, y) => {
    fields[y] = Array(world.height).fill(undefined).map((_, x) => new serverV1Types.World_Field({ coords: { x, y } }))
  })
  world.fields.forEach(field => {
    fields[field.coords!.y][field.coords!.x] = field
  })

  return <div style={{ display: 'flex' }}>
    <div style={gridStyle}>{fields.flat().map(field => <Field field={field} selectedField={selectedField} />)}</div>
    <FieldInfo selectedField={selectedField} />
  </div>
}


function Field({ field, selectedField }: { field: serverV1Types.World_Field, selectedField: Signal<serverV1Types.World_Field | undefined> }) {
  function kindStyle() {
    switch (field.entityKind) {
      case serverV1Types.World_Field_EntityKind.VILLAGE:
        return { backgroundColor: 'green', cursor: 'pointer' }

      case serverV1Types.World_Field_EntityKind.TEMPLE:
        return { backgroundColor: 'yellow' }

      default:
        return {}
    }
  }

  function onFieldDblClick() {
    switch (field.entityKind) {
      case serverV1Types.World_Field_EntityKind.VILLAGE:
        navigate(`/villages/${field.entityId}`)
        break

      case serverV1Types.World_Field_EntityKind.TEMPLE:
        alert('TODO: Open temple page')
        break
    }
  }

  const navigate = useNavigate()

  const fieldStyle = {
    position: 'relative',
    borderTop: '1px solid black',
    borderLeft: '1px solid black',
    ...kindStyle(),
  }

  return (
    <div style={fieldStyle} onClick={() => selectedField.value = field} onDblClick={onFieldDblClick}></div>
  )
}

function FieldInfo({ selectedField }: { selectedField: Signal<serverV1Types.World_Field | undefined> }) {
  const entityKindName = useComputed(() => {
    switch (selectedField.value?.entityKind) {
      case serverV1Types.World_Field_EntityKind.VILLAGE:
        return 'Village'

      case serverV1Types.World_Field_EntityKind.TEMPLE:
        return 'Temple'

      default:
        return 'Wild Field'
    }
  })

  function Info({ field }: { field: serverV1Types.World_Field }) {
    async function attack() {
      try {
        const { village } = await server.getVillage({ id: 1 }) // TODO: Get current village

        await server.attack({
          attack: new serverV1Types.Attack({
            villageId: village!.id,
            targetCoords: field.coords,
            troopQuantity: village!.troopQuantity, // TODO: Pick troops to attack
          }),
        })

        navigate(0)
      } catch (err) {
        alert(`Failed to attack world field (coords: ${field.coords}): ${err}`)
      }
    }

    function Actions() {
      switch (field.entityKind) {
        case serverV1Types.World_Field_EntityKind.UNSPECIFIED:
          return <button onClick={attack}>Attack</button>

        default:
          return null
      }
    }

    const navigate = useNavigate()

    return (<>
      <h2>{entityKindName}</h2>
      <p><span>Coords</span> {field.coords!.x}, {field.coords!.y}</p>
      <Actions />
    </>)
  }

  return <div>
    {selectedField.value ? <Info field={selectedField.value} /> : <h2>No field selected</h2>}
  </div>
}