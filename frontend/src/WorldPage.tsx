import { useContext } from 'preact/hooks'
import { useSignal, Signal, useSignalEffect, signal, batch } from '@preact/signals';
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import * as entities from './entities'
import server from './server'
import { JSX } from 'preact/jsx-runtime';
import { createContext } from 'preact';

function createWorldState(preload = true) {
  const loading = signal(true)
  const world = signal<serverV1.World>(new serverV1.World())
  const villages = signal<entities.Village[]>([])
  const troops = signal<entities.Troop[]>([])
  const outgoingAttacks = signal<serverV1.Attack[]>([])

  async function load() {
    const results = await Promise.all([
      server.getWorld({ loadFields: true }),
      server.getVillages({ playerId: 1 }), // TODO: Use auth player
      server.getTroops({}),
      server.getAttacks({}),
    ])

    batch(() => {
      loading.value = false
      world.value = results[0].world!
      villages.value = results[1].villages.map(village => new entities.Village(village))
      troops.value = results[2].troops.map(troop => new entities.Troop(troop))
      outgoingAttacks.value = results[3].outgoingAttacks
    })
  }

  function getWorldFieldById(id: number): serverV1.World_Field | undefined {
    return world.peek()!.fields.find(f => f.id == id)
  }

  if (preload) load().catch(err => alert(err))

  return {
    loading, world, villages, troops, outgoingAttacks,
    getWorldFieldById,
  }
}

const WorldContext = createContext(createWorldState(false))

export default () => {
  return <WorldContext.Provider value={createWorldState()}>
    <WorldLoader />
  </WorldContext.Provider>
}

function WorldLoader() {
  const { loading, villages, troops, world, outgoingAttacks } = useContext(WorldContext)

  if (loading.value) return <div>Loading...</div>

  // TODO: Replace with SSE
  useSignalEffect(() => {
    const intervalId = loading.value ? 0 : setInterval(async () => {
      await Promise.all([
        server.getWorld({ loadFields: true }).then(res => world.value = res.world!),
        server.getAttacks({}).then(res => outgoingAttacks.value = res.outgoingAttacks),
      ]).catch(err => alert(err))
    }, 1000)

    return () => {
      if (intervalId !== -1) clearInterval(intervalId)
    }
  })

  return (
    <div>
      <h1>World Map</h1>
      <World world={world.value!} villages={villages.value} troops={troops.value} />
      <Attacks />
    </div>
  )
}

function World({ world, villages, troops }: { world: serverV1.World, villages: entities.Village[], troops: entities.Troop[] }) {
  const selectedField = useSignal<serverV1.World_Field | undefined>(undefined)

  // TODO: Convert to tailwind
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

  return (<div class="flex">
    <div style={gridStyle}>{fields.flat().map(field => <Field field={field} selectedField={selectedField} />)}</div>
    <FieldInfo selectedField={selectedField} villages={villages} troops={troops} />
  </div>)
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

  // TODO: Convert to tailwind
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

function FieldInfo({ selectedField, villages, troops }: { selectedField: Signal<serverV1.World_Field|undefined>, villages: entities.Village[], troops: entities.Troop[] }) {
  if (selectedField.value == undefined) return <div><h2>No field selected</h2></div>

  let title = World_Field_EntityKindToString(selectedField.value.entityKind)
  const entity = useSignal<undefined|serverV1.Temple>(undefined)

  const bottom: JSX.Element[] = []

  switch (selectedField.value.entityKind) {
    case serverV1.World_Field_EntityKind.WILD:
      const selectedVillage = useSignal(villages[0])
      const selectedTroopQuantity = useSignal<{ [key: string]: number }>(Object.fromEntries(troops.map(t => ([t.kind, 0]))))
      function updateSelectedTroopQuantity(kind: string, quantity: number) {
        selectedTroopQuantity.value = { ...selectedTroopQuantity.value, [kind]: quantity }
      }
      const { outgoingAttacks } = useContext(WorldContext)

      async function attack() {
        try {
          const totalTroops = Object.values(selectedTroopQuantity.peek()).reduce((acc, q) => acc + q, 0)
          if (totalTroops == 0) {
            alert("No troops to attack")
            return
          }

          const { attack } = await server.issueAttack({
            villageId: selectedVillage.peek().id,
            targetCoords: selectedField.peek()!.coords,
            troopQuantity: selectedTroopQuantity.peek(),
          })
          outgoingAttacks.value = [...outgoingAttacks.value, attack!]
        } catch (err) {
          alert(`Failed to issue attack (coords: ${selectedField.peek()!.coords}): ${err}`)
        }
      }

      bottom.push(
        <div>
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
      )
      break

    case serverV1.World_Field_EntityKind.TEMPLE:
      if (entity.value == undefined) {
        server.getTemple({ id: selectedField.value.entityId })
          .then(({ temple }) => entity.value = temple!)
          .catch(err => alert(err))
        bottom.push(<p>Loading...</p>)
      } else {
        const temple = entity.peek()!
        const selectedVillage = useSignal(villages[0])
        const goldToDonate = useSignal(0)
        const navigate = useNavigate()

        async function donate() {
          await server.issueTempleDonationOrder({
            id: temple.id,
            gold: goldToDonate.peek(),
            villageId: selectedVillage.peek().id,
          })
          navigate(0) // TODO: Get all temples and update gold
        }

        bottom.push(
          <div>
            <p>{temple.gold} gold left</p>

            <label>Village</label>
            <select value={selectedVillage.value.id} onChange={ev => selectedVillage.value = villages.find(v => v.id == +ev.currentTarget.value)!}>
              {villages.map(v => (<option value={v.id}>{v.name}</option>))}
            </select>
            <input type="number" min={0} max={selectedVillage.value.resources!.gold}
              value={goldToDonate}
              onChange={ev => goldToDonate.value = +ev.currentTarget.value}
            />

            <button onClick={donate}>Donate</button>
          </div>
        )
      }
      break
  }

  return <div>
    <h2>{title}</h2>
    <p><span>Coords</span> {selectedField.value.coords!.x}, {selectedField.value.coords!.y}</p>
    {bottom}
  </div>
}

function Attacks() {
  async function cancelAttack(id: number) {
    try {
      await server.cancelAttack({ id })
      outgoingAttacks.value = outgoingAttacks.value.filter(a => a.id != id)
    } catch (err) {
      alert(`Failed to cancel attack (id: ${id}): ${err}`)
    }
  }

  const { outgoingAttacks, getWorldFieldById } = useContext(WorldContext)

  let outgoingAttacksListBody: JSX.Element
  if (outgoingAttacks.value.length == 0) {
    outgoingAttacksListBody = <p>No attacks</p>
  } else {
    outgoingAttacksListBody = <div>{
      outgoingAttacks.value.map(attack => {
        const worldField = getWorldFieldById(attack.worldFieldId)!
        return (<div>
          <Link to={`/world/fields/${worldField.id}`}>{World_Field_EntityKindToString(worldField.entityKind)}</Link>
          <span>{`(${worldField.coords!.x}, ${worldField.coords!.y})`} - {attack.timeLeft}s</span>
          <button onClick={() => cancelAttack(attack.id)}>Cancel</button>
        </div>)
      })
    }</div>
  }

  return (
    <div>
      <h2>Attacks</h2>
      <h3>Outgoing</h3>
      {outgoingAttacksListBody}
      <h3>Incoming</h3>
      <p>TODO</p>
    </div>
  )
}

function World_Field_EntityKindToString(entityKind: serverV1.World_Field_EntityKind): string {
  switch (entityKind) {
    case serverV1.World_Field_EntityKind.VILLAGE:
      return 'Village'

    case serverV1.World_Field_EntityKind.TEMPLE:
      return 'Temple'

    default:
      return 'Wild Field'
  }
}