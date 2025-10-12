import type { JSX, ParentProps } from "solid-js"

import {
  createSignal, Accessor, Setter,
  Show, For, Switch, Match
} from "solid-js"
import { useNavigate, A } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import {
  StoreLoader, store, playerId, playerVillages,
  issueTroopMovementOrder, cancelTroopMovementOrder
} from './store'

export default function WorldPage() {
  return <StoreLoader>
    {() =>
      <div>
        <h1>World Map</h1>
        <World />
        <TroopMovements />
      </div>
    }
  </StoreLoader>
}

function World() {
  const [selectedField, setSelectedField] = createSignal<serverV1.World_Field | undefined>(undefined)

  // TODO: Convert to tailwind
  const gridStyle = {
    'display': 'grid',
    'grid-template-columns': `repeat(${store.world.width}, 20px)`,
    'grid-template-rows': `repeat(${store.world.height}, 20px)`,
    'width': 'fit-content',
    'border-bottom': '1px solid black',
    'border-right': '1px solid black',
  } as JSX.CSSProperties

  const fields = Array(store.world.width).fill(undefined)
  fields.forEach((_, y) => {
    fields[y] = Array(store.world.height).fill(undefined).map((_, x) => ({ coords: `${x}_${y}` } as serverV1.World_Field))
  })
  for (const coords in store.world.fields) {
    const [x, y] = coords.split('_').map(Number)
    fields[y][x] = store.world.fields[coords]
  }

  return (<div class="flex">
    <div style={gridStyle}>
      <For each={fields.flat()}>
        {(field) => <Field field={field} setSelectedField={setSelectedField} />}
      </For>
    </div>
    <FieldInfo selectedField={selectedField} />
  </div>)
}

function Field({ field, setSelectedField }: { field: serverV1.World_Field, setSelectedField: Setter<serverV1.World_Field | undefined> }) {
  const navigate = useNavigate()

  function kindStyle(): JSX.CSSProperties {
    switch (field.kind) {
      case serverV1.World_Field_Kind.VILLAGE:
        const village = store.world.villages[field.coords]
        return { 'background-color': village?.playerId == playerId ? 'green' : 'red' , 'cursor': 'pointer' }

      case serverV1.World_Field_Kind.TEMPLE:
        return { 'background-color': 'yellow' }

      default:
        return {}
    }
  }

  function open() {
    switch (field.kind) {
      case serverV1.World_Field_Kind.VILLAGE:
        navigate(`/villages/${field.coords}`)
        break

      case serverV1.World_Field_Kind.TEMPLE:
        alert('TODO: Open temple page')
        break
    }
  }

  // TODO: Convert to tailwind
  const fieldStyle = {
    'position': 'relative',
    'border-top': '1px solid black',
    'border-left': '1px solid black',
    ...kindStyle(),
  } as JSX.CSSProperties

  return (
    <div style={fieldStyle} onClick={() => setSelectedField(field)} onDblClick={open}></div>
  )
}

function FieldInfo({ selectedField }: { selectedField: Accessor<serverV1.World_Field | undefined> }) {
  function Wrapper({ children }: ParentProps<{}>) {
    const coords = () => {
      const [x, y] = selectedField()!.coords.split('_').map(Number)
      return { x, y }
    }
    
    return <div>
      <h2>{World_Field_EntityKindToString(selectedField()!.kind)}</h2>
      <p><span>Coords</span> {coords().x},{coords().y}</p>
      {children}
    </div>
  }

  function Village() {
    const village = () => store.world.villages[selectedField()!.coords]
    const troops = () => Object.values(store.world.troops)
    const otherPlayerVillages = () => playerVillages().filter(v => v.coords != village().coords)

    function Attackable() {
      const [selectedVillageCoords, setSelectedVillageCoords] = createSignal(otherPlayerVillages()[0].coords)
      const [selectedTroopQuantity, setSelectedTroopQuantity] = createSignal(Object.fromEntries(troops().map(t => ([t.id, 0]))))

      const selectedVillage = () => otherPlayerVillages().find(v => v.coords == selectedVillageCoords())

      return <div>
        <label>Village</label>
        <select value={selectedVillageCoords()} onChange={ev => setSelectedVillageCoords(ev.currentTarget.value)}>
          <For each={otherPlayerVillages()}>
            {v => <option value={v.coords}>{v.coords}</option>}
          </For>
        </select>

        <label>Troops</label>
        <div>
          <For each={troops()}>
            {t => {
              const maxQuantity = selectedVillage()!.troops[t.id]

              return <div>
                <span>{t.name} ({maxQuantity})</span>
                <input type="number" min={0} max={maxQuantity}
                  value={selectedTroopQuantity()[t.id]}
                  onChange={ev => setSelectedTroopQuantity({ [t.id]: +ev.currentTarget.value })}
                />
              </div>
            }}
          </For>
        </div>

        <button onClick={() => issueTroopMovementOrder(selectedVillageCoords(), selectedField()!.coords, selectedTroopQuantity())}>Attack</button>
      </div>
    }

    return <Wrapper>
      <Show when={otherPlayerVillages().length > 0}>
        <Attackable />
      </Show>
    </Wrapper>
  }

  function Temple() {
    const temple = () => store.world.temples[selectedField()!.coords]
    const [selectedVillageCoords, setSelectedVillageCoords] = createSignal(Object.values(store.world.villages)[0]!.coords)
    const [goldToDonate, setGoldToDonate] = createSignal(0)

    const selectedVillage = () => playerVillages().find(v => v.coords == selectedVillageCoords())!

    async function donate() {
      alert("TODO: FieldInfo.Temple.donate")
    }

    return <Wrapper>
      <div>
        <p>{temple().resources!.gold} gold left</p>

        <label>Village</label>
        <select value={selectedVillageCoords()} onChange={ev => setSelectedVillageCoords(ev.currentTarget.value)}>
          {Object.values(playerVillages()).map(v => (<option value={v.coords}>{v.coords}</option>))}
        </select>
        <input type="number" min={0} max={selectedVillage().resources!.gold}
          value={goldToDonate()}
          onChange={ev => setGoldToDonate(+ev.currentTarget.value)}
        />

        <button onClick={donate}>Donate</button>
      </div>
    </Wrapper>
  }

  return <>
    <Switch fallback={<Wrapper/>}>
      <Match when={selectedField() == undefined}>
        <div><h2>No field selected</h2></div>
      </Match>
      <Match when={selectedField()?.kind == serverV1.World_Field_Kind.VILLAGE}>
        <Village />
      </Match>
      <Match when={selectedField()?.kind == serverV1.World_Field_Kind.TEMPLE}>
        <Temple/>
      </Match>
    </Switch>
  </>
}

function World_Field_EntityKindToString(entityKind: serverV1.World_Field_Kind): string {
  switch (entityKind) {
    case serverV1.World_Field_Kind.VILLAGE:
      return 'Village'

    case serverV1.World_Field_Kind.TEMPLE:
      return 'Temple'

    default:
      return 'Wild Field'
  }
}

function TroopMovements() {
  function fieldPlayerId(coords: string) {
    const field = store.world.fields[coords]
    if (field.kind == serverV1.World_Field_Kind.VILLAGE) {
      return store.world.villages[coords].playerId
    }
    return undefined
  }
  const outgoingAttacks = () => Object.values(store.world.troopMovementOrders).filter(o => {
    const sourcePlayerId = fieldPlayerId(o.sourceCoords)
    const targetPlayerId = fieldPlayerId(o.targetCoords)
    return sourcePlayerId == playerId && targetPlayerId != playerId
  })
  const incomingAttacks = () => Object.values(store.world.troopMovementOrders).filter(o => {
    const sourcePlayerId = fieldPlayerId(o.sourceCoords)
    const targetPlayerId = fieldPlayerId(o.targetCoords)
    return sourcePlayerId != playerId && targetPlayerId == playerId
  })
  const supports = () => Object.values(store.world.troopMovementOrders).filter(o => {
    const sourcePlayerId = fieldPlayerId(o.sourceCoords)
    const targetPlayerId = fieldPlayerId(o.targetCoords)
    return sourcePlayerId == playerId && targetPlayerId == playerId
  })

  function Movements({ title, orders }: {title: string, orders: Accessor<serverV1.TroopMovementOrder[]>}) {
    return <>
      <h3>{title}</h3>
      <Show when={orders().length > 0} fallback={<p>No troop movements</p>}>
        <div>
          <For each={orders()}>
            {order => {
              const sourceField = () => store.world.fields[order.sourceCoords]
              const [sourceX, sourceY] = order.sourceCoords.split('_').map(Number)
              const targetField = () => store.world.fields[order.targetCoords]
              const [targetX, targetY] = order.targetCoords.split('_').map(Number)

              return (<div>
                <A href={`/world/fields/${order.sourceCoords}`}>{World_Field_EntityKindToString(sourceField().kind)} ({sourceX},{sourceY})</A>
                <span> -&gt; </span>
                <A href={`/world/fields/${order.targetCoords}`}>{World_Field_EntityKindToString(targetField().kind)} ({targetX},{targetY})</A>
                <span> - {order.timeLeft}s </span>
                <button onClick={() => cancelTroopMovementOrder(order)}>Cancel</button>
              </div>)
            }}
          </For>
        </div>
      </Show>
    </>
  }

  return <div>
    <h2>Troop Movements</h2>
    <Movements title="Outgoing" orders={outgoingAttacks} />
    <h3>Incoming</h3>
    <p>(TODO)</p>
  </div>
}