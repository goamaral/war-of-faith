import { useState, useEffect } from 'preact/hooks'
import { useSignal, Signal, useComputed } from '@preact/signals';
import { useNavigate } from 'react-router-dom' 

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import * as entities from './entities'
import server from './server'

export default () => {
  const [loading, setLoading] = useState(true)
  const [world, setWorld] = useState<serverV1.World>(new serverV1.World())
  const [villages, setVillages] = useState<entities.Village[]>([])
  const [troops, setTroops] = useState<entities.Troop[]>([])

  useEffect(() => {
    Promise.all([
      server.getWorld({ loadFields: true })
        .then(({ world }) => setWorld(world!)),
      server.getVillages({ playerId: 1 })
        .then(({ villages }) => setVillages(villages!.map(village => new entities.Village(village)))), // TODO: Use auth player
      server.getTroops({})
        .then(({ troops }) => setTroops(troops!.map(troop => new entities.Troop(troop)))),
    ]).then(() => setLoading(false))
  }, [])

  if (loading) {
    return <div>Loading...</div>
  } else {
    return (
      <div>
        <h1>World Map</h1>
        <World world={world} villages={villages} troops={troops} />
      </div>
    )
  }
}

function World({ world, villages, troops }: { world: serverV1.World, villages: entities.Village[], troops: entities.Troop[] }) {
  const selectedField = useSignal<serverV1.World_Field | undefined>(undefined)

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
    fields[y] = Array(world.height).fill(undefined).map((_, x) => new serverV1.World_Field({ coords: { x, y } }))
  })
  world.fields.forEach(field => {
    fields[field.coords!.y][field.coords!.x] = field
  })

  return <div style={{ display: 'flex' }}>
    <div style={gridStyle}>{fields.flat().map(field => <Field field={field} selectedField={selectedField} />)}</div>
    <FieldInfo selectedField={selectedField} villages={villages} troops={troops} />
  </div>
}


function Field({ field, selectedField }: { field: serverV1.World_Field, selectedField: Signal<serverV1.World_Field | undefined> }) {
  function kindStyle() {
    switch (field.entityKind) {
      case serverV1.World_Field_EntityKind.VILLAGE:
        return { backgroundColor: 'green', cursor: 'pointer' }

      case serverV1.World_Field_EntityKind.TEMPLE:
        return { backgroundColor: 'yellow' }

      default:
        return {}
    }
  }

  function open() {
    switch (field.entityKind) {
      case serverV1.World_Field_EntityKind.VILLAGE:
        navigate(`/villages/${field.entityId}`)
        break

      case serverV1.World_Field_EntityKind.TEMPLE:
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
    <div style={fieldStyle} onClick={() => selectedField.value = field} onDblClick={open}></div>
  )
}

function FieldInfo({ selectedField, villages, troops }: { selectedField: Signal<serverV1.World_Field | undefined>, villages: entities.Village[], troops: entities.Troop[] }) {
  const entityKindName = useComputed(() => {
    switch (selectedField.value?.entityKind) {
      case serverV1.World_Field_EntityKind.VILLAGE:
        return 'Village'

      case serverV1.World_Field_EntityKind.TEMPLE:
        return 'Temple'

      default:
        return 'Wild Field'
    }
  })

  function Info({ field }: { field: serverV1.World_Field }) {
    async function attack() {
      try {
        const totalTroops = Object.values(selectedTroopQuantity.value).reduce((acc, q) => acc + q, 0)
        if (totalTroops == 0) {
          alert("No troops to attack")
          return
        }

        await server.attack({
          attack: new serverV1.Attack({
            villageId: selectedVillage.peek().id,
            targetCoords: field.coords,
            troopQuantity: selectedTroopQuantity.peek(),
          }),
        })

        navigate(0)
      } catch (err) {
        alert(`Failed to attack world field (coords: ${field.coords}): ${err}`)
      }
    }

    const navigate = useNavigate()
    const selectedVillage = useSignal(villages[0])
    const selectedTroopQuantity = useSignal<{[key: string]: number}>(Object.fromEntries(troops.map(t => ([t.kind, 0]))))
    function updateSelectedTroopQuantity(kind: string, quantity: number) {
      selectedTroopQuantity.value = {  ...selectedTroopQuantity.value, [kind]: quantity }
    }

    function Actions() {
      switch (field.entityKind) {
        case serverV1.World_Field_EntityKind.UNSPECIFIED:
          return <div>
            <label>Village</label>
            <select value={selectedVillage.value.id} onChange={ev => selectedVillage.value = villages.find(v => v.id == +ev.currentTarget.value)!}>
              {villages.map(v => (<option value={v.id}>{v.name}</option>))}
            </select>

            <label>Troops</label>
            <div>
              {troops.map(t => {
                const maxQuantity = selectedVillage.value.troopQuantity[t.kind]
                return (<div key={t.kind}>
                  <span>{t.name} ({maxQuantity})</span>
                  <input type="number" min={0} max={maxQuantity}
                    value={selectedTroopQuantity.value[t.kind]}
                    onChange={ev => updateSelectedTroopQuantity(t.kind, +ev.currentTarget.value)}
                  />
                </div>)
              })}
            </div>

            <button onClick={attack}>Attack</button>
          </div>

        default:
          return null
      }
    }

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