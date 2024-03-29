import { useEffect } from 'preact/hooks'
import { useSignal, Signal } from '@preact/signals'
import { useNavigate } from 'react-router-dom'
import { Link } from "react-router-dom"
import { JSX } from 'preact/jsx-runtime'
import { create } from 'zustand'

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import * as entities from './entities'
import { serverV1Client } from './api'

interface Store {
  world: serverV1.World
  villages: entities.Village[]
  troops: serverV1.Troop[]
  outgoingAttacks: serverV1.Attack[]
  load: () => Promise<void>
  consumeVillageEvent: (event: serverV1.Village_Event) => void
  consumeAttackEvent: (event: serverV1.Attack_Event) => void
  updateWorldField: (worldField: serverV1.World_Field) => void
  issueAttack: (fvillageId: number, coords: serverV1.Coords|undefined, troopQuantity: { [key: string]: number }) => Promise<void>
  cancelAttack: (id: number) => Promise<void>
}

const useStore = create<Store>((set, get) => ({
  world: new serverV1.World(),
  villages: [],
  troops: [],
  outgoingAttacks: [],

  async load() {
    const results = await Promise.all([
      serverV1Client.getWorld({ loadFields: true }),
      serverV1Client.getVillages({}),
      serverV1Client.getTroops({}),
      serverV1Client.getAttacks({}),
    ])

    set(() => ({
      world: results[0].world,
      villages: results[1].villages.map(v => new entities.Village(v)),
      troops: results[2].troops,
      outgoingAttacks: results[3].outgoingAttacks,
    }))
  },

  consumeVillageEvent(event: serverV1.Village_Event) {
    console.debug("New village event", event)
    const villages = get().villages

    switch (event.action) {
      case serverV1.Village_Event_Action.CREATE: {
        set({ villages: [...villages, new entities.Village(event.village!)] })
        break
      }

      case serverV1.Village_Event_Action.UPDATE: {
        set({
          villages: villages.map(a => (a.id == event.village?.id) ? new entities.Village(event.village!) : a)
        })
        break
      }

      case serverV1.Village_Event_Action.DELETE: {
        set({ villages: villages.filter(a => a.id != event.village?.id) })
        break
      }

      default:
        alert(`Unknown village event action: ${event.action}`)
        break
    }
  },

  consumeAttackEvent(event: serverV1.Attack_Event) {
    console.debug("New attack event", event)
    const outgoingAttacks = get().outgoingAttacks

    switch (event.action) {
      case serverV1.Attack_Event_Action.CREATE: {
        set({ outgoingAttacks: [...outgoingAttacks, event.attack!] })
        break
      }

      case serverV1.Attack_Event_Action.UPDATE: {
        set({
          outgoingAttacks: outgoingAttacks.map(a => (a.id == event.attack?.id) ? event.attack! : a)
        })
        break
      }

      case serverV1.Attack_Event_Action.DELETE: {
        set({ outgoingAttacks: outgoingAttacks.filter(a => a.id != event.attack?.id) })
        break
      }

      default:
        alert(`Unknown attack event action: ${event.action}`)
        break
    }
  },

  updateWorldField(worldField: serverV1.World_Field) {
    const world = get().world
    const index = world.fields.findIndex(f => f.id == worldField.id)
    if (index == -1) {
      world.fields.push(worldField)
    } else {
      world.fields[index] = worldField
    }
    set(() => ({ world: world.clone() }))
  },

  async issueAttack(villageId: number, targetCoords: serverV1.Coords|undefined, troopQuantity: { [key: string]: number }) {
    try {
      if (targetCoords == undefined) return alert("No target to attack")

      const totalTroops = Object.values(troopQuantity).reduce((acc, q) => acc + q, 0)
      if (totalTroops == 0) return alert("No troops to attack")

      await serverV1Client.issueAttack({ villageId, targetCoords, troopQuantity })
    } catch (err) {
      alert(`Failed to issue attack (coords: ${targetCoords?.toJsonString()}): ${err}`)
    }
  },

  async cancelAttack(id: number) {
    try {
      await serverV1Client.cancelAttack({ id })
      set({ outgoingAttacks: get().outgoingAttacks.filter(a => a.id != id) })
    } catch (err) {
      alert(`Failed to cancel attack (id: ${id}): ${err}`)
    }
  },
}))

function getWorldFieldById(id: number): serverV1.World_Field | undefined {
  return useStore(s => s.world.fields.find(f => f.id == id))
}

function getVillageById(id: number): serverV1.Village | undefined {
  return useStore(s => s.villages.find(v => v.id == id))
}

function getPlayerVillages(): entities.Village[] {
  // TODO: Use auth player
  return useStore(s => s.villages.filter(v => v.playerId == 1))
}

export default () => <WorldLoader />

function WorldLoader() {
  const loaded = useSignal(false)
  const load = useStore(state => state.load)
  useEffect(() => {
    load()
      .then(() => loaded.value = true)
      .catch(err => alert(err))
  }, [])

  if (!loaded.value) return <div>Loading...</div>

  const consumeVillageEvent = useStore(state => state.consumeVillageEvent)
  const consumeAttackEvent = useStore(state => state.consumeAttackEvent)
  const updateWorldField = useStore(state => state.updateWorldField)

  useEffect(() => {
    const villagesStream = serverV1Client.subscribeToVillages({})
    async function subscribeToVillages() {
      try {
        for await (const villageEvent of villagesStream) consumeVillageEvent(villageEvent)
      } catch (err) {
        console.error(err)
        subscribeToVillages()
      }
    }
    subscribeToVillages()
  }, [])

  useEffect(() => {
    const attacksStream = serverV1Client.subscribeToAttacks({})
    async function subscribeToAttacks() {
      try {
        for await (const attackEvent of attacksStream) consumeAttackEvent(attackEvent)
      } catch (err) {
        console.error(err)
        subscribeToAttacks()
      }
    }
    subscribeToAttacks()
  }, [])

  useEffect(() => {
    const worldFieldsStream = serverV1Client.subscribeToWorldFields({})
    async function subscribeToWorldFields() {
      try {
        for await (const worldFiled of worldFieldsStream) updateWorldField(worldFiled)
      } catch (err) {
        console.error(err)
        subscribeToWorldFields()
      }
    }
    subscribeToWorldFields()
  }, [])

  return (
    <div>
      <h1>World Map</h1>
      <World />
      <Attacks />
    </div>
  )
}

function World() {
  const world = useStore(state => state.world)

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
    <FieldInfo selectedField={selectedField} />
  </div>)
}

function Field({ field, selectedField }: { field: serverV1.World_Field, selectedField: Signal<serverV1.World_Field | undefined> }) {
  const navigate = useNavigate()

  function kindStyle() {
    switch (field.entityKind) {
      case serverV1.World_Field_EntityKind.VILLAGE:
        const village = getVillageById(field.entityId)
        return { backgroundColor: village?.playerId == 1 ? 'green' : 'red' , cursor: 'pointer' }

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

function FieldInfo({ selectedField }: { selectedField: Signal<serverV1.World_Field | undefined> }) {
  if (selectedField.value == undefined) return <div><h2>No field selected</h2></div>

  const bottom: JSX.Element[] = []

  switch (selectedField.value.entityKind) {
    case serverV1.World_Field_EntityKind.WILD: {
      const troops = useStore(s => s.troops)
      const issueAttack = useStore(s => s.issueAttack)
      const playerVillages = getPlayerVillages()

      const selectedVillageId = useSignal(playerVillages[0].id)
      const selectedTroopQuantity = useSignal<{ [key: string]: number }>(Object.fromEntries(troops.map(t => ([t.kind, 0]))))
      function updateSelectedTroopQuantity(kind: string, quantity: number) {
        selectedTroopQuantity.value = { ...selectedTroopQuantity.value, [kind]: quantity }
      }
      
      bottom.push(
        <div>
          <label>Village</label>
          <select value={selectedVillageId.value} onChange={ev => selectedVillageId.value = +ev.currentTarget.value}>
            {playerVillages.map(v => (<option value={v.id}>{v.name}</option>))}
          </select>

          <label>Troops</label>
          <div>
            {troops.map(t => {
              const maxQuantity = playerVillages.find(v => v.id == selectedVillageId.value)!.troopQuantity[t.kind]
              return (<div key={t.kind}>
                <span>{t.name} ({maxQuantity})</span>
                <input type="number" min={0} max={maxQuantity}
                  value={selectedTroopQuantity.value[t.kind]}
                  onChange={ev => updateSelectedTroopQuantity(t.kind, +ev.currentTarget.value)}
                />
              </div>)
            })}
          </div>

          <button onClick={() => issueAttack(selectedVillageId.value, selectedField.value?.coords, selectedTroopQuantity.value)}>Attack</button>
        </div>
      )
      break
    }

    case serverV1.World_Field_EntityKind.TEMPLE: {
      const villages = useStore(state => state.villages)

      const entity = useSignal<undefined | serverV1.Temple>(undefined)

      if (entity.value == undefined) {
        serverV1Client.getTemple({ id: selectedField.value.entityId })
          .then(({ temple }) => entity.value = temple!)
          .catch(err => alert(err))
        bottom.push(<p>Loading...</p>)
      } else {
        const temple = entity.peek()!
        const selectedVillage = useSignal(villages[0])
        const goldToDonate = useSignal(0)
        const navigate = useNavigate()

        async function donate() {
          await serverV1Client.issueTempleDonationOrder({
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
  }

  return <div>
    <h2>{World_Field_EntityKindToString(selectedField.value.entityKind)}</h2>
    <p><span>Coords</span> {selectedField.value.coords!.x}, {selectedField.value.coords!.y}</p>
    {bottom}
  </div>
}

function Attacks() {
  const outgoingAttacks = useStore(state => state.outgoingAttacks)
  const cancelAttack = useStore(state => state.cancelAttack)

  let outgoingAttacksListBody: JSX.Element
  if (outgoingAttacks.length == 0) {
    outgoingAttacksListBody = <p>No attacks</p>
  } else {
    outgoingAttacksListBody = <div>{
      outgoingAttacks.map(attack => {
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