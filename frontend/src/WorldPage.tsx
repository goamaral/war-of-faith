import type { JSX, ParentProps, Accessor, Setter } from "solid-js"

import {
  createSignal, createEffect, createMemo, batch,
  Show, For, Switch, Match,
} from "solid-js"
import { useNavigate, A } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import { cancelMovementOrder, issueMovementOrder } from "./actions/movement_orders"
import { IssueMovementOrder } from "./state/movement_orders"
import { StoreLoader, store } from './store'
import { countTroops, decodeCoords, playerFields } from "./state/helpers"
import { LEADER, newFieldTroops, RAIDER, World_Field_KindToString } from "./state/config"


export default function WorldPage() {
  return <StoreLoader>
    {() =>
      <div>
        <h1>World Map</h1>
        <World />
        <Movements />
      </div>
    }
  </StoreLoader>
}

function World() {
  const [targetField, setTargetField] = createSignal<serverV1.World_Field | undefined>(undefined)

  // TODO: Convert to tailwind
  const gridStyle = {
    'display': 'grid',
    'grid-template-columns': `repeat(${store.world.width}, 20px)`,
    'grid-template-rows': `repeat(${store.world.height}, 20px)`,
    'width': 'fit-content',
    'height': 'fit-content',
    'border-bottom': '1px solid black',
    'border-right': '1px solid black',
  } as JSX.CSSProperties


  const cells = createMemo(() => {
    const fields = Array(store.world.width).fill(undefined)
    fields.forEach((_, y) => fields[y] = Array(store.world.height).fill(undefined))
    for (const coords in store.world.fields) {
      const { x, y } = decodeCoords(coords)
      fields[y][x] = store.world.fields[coords]
    }
    return fields.flat()
  })

  return (<div class="flex">
    <div style={gridStyle}>
      <For each={cells()}>
        {(field) => <Field field={field} setField={setTargetField} />}
      </For>
    </div>
    <FieldInfo targetField={targetField} />
  </div>)
}

function Field({ field, setField }: { field: serverV1.World_Field, setField: Setter<serverV1.World_Field | undefined> }) {
  const navigate = useNavigate()

  function kindStyle(): JSX.CSSProperties {
    switch (field.kind) {
      case serverV1.World_Field_Kind.VILLAGE:
        return { 'background-color': field.playerId == store.playerId ? 'green' : 'red' }

      case serverV1.World_Field_Kind.TEMPLE:
        let color = "yellow"
        if (field.playerId) {
          color = field.playerId == store.playerId ? "yellowgreen" : "lightsalmon	"
        }
        return { 'background-color': color }

      default:
        return {}
    }
  }

  // TODO: Convert to tailwind
  const fieldStyle = () => ({
    'position': 'relative',
    'border-top': '1px solid black',
    'border-left': '1px solid black',
    'cursor': 'pointer',
    ...kindStyle(),
  } as JSX.CSSProperties)

  return (
    <div style={fieldStyle()} onClick={() => setField(field)} onDblClick={() => navigate(`/world/${field.coords}`)}></div>
  )
}

function FieldInfo({ targetField }: { targetField: Accessor<serverV1.World_Field | undefined> }) {
  function Wrapper({ children }: ParentProps<{}>) {
    const targetCoords = () => decodeCoords(targetField()!.coords)
    
    return <div>
      <h2>{World_Field_KindToString(targetField()!.kind)}</h2>
      <p><span>Coords</span> {targetCoords().x},{targetCoords().y}</p>
      {children}
    </div>
  }

  const sourceFields = createMemo(() => {
    if (targetField() == undefined) return []
    const fields = playerFields(store.world, store.playerId, f => f.coords != targetField()?.coords)
    const troopScore = (f: serverV1.World_Field) => 100 * f.troops[LEADER] + f.troops[RAIDER]
    return fields.sort((a, b) => troopScore(b) - troopScore(a))
  })

  function Targatable() {
    const [selectedSourceCoords, setSelectedSourceCoords] = createSignal(sourceFields()[0].coords)
    createEffect(() => setSelectedSourceCoords(sourceFields()[0].coords))
    
    const troops = Object.values(store.world.troops)
    const [selectedTroopQuantity, setSelectedTroopQuantity] = createSignal(newFieldTroops())
    const [selectedGold, setSelectedGold] = createSignal(0)

    const maxGold = createMemo(() => IssueMovementOrder.maxGold(store.world, selectedSourceCoords(), selectedTroopQuantity()))

    // Prevent invalid inputs
    createEffect(() => {
      const _selectedGold = selectedGold()
      const _selectedSourceCoords = selectedSourceCoords()
      const _selectedTroopQuantity = selectedTroopQuantity()

      batch(() => {
        const maxGold = IssueMovementOrder.maxGold(store.world, _selectedSourceCoords, _selectedTroopQuantity)
        if (_selectedGold < 0) return setSelectedGold(0)
        if (_selectedGold > maxGold) return setSelectedGold(maxGold)
      })
    
      batch(() => {
        Object.entries(_selectedTroopQuantity).forEach(([troopId, quantity]) => {
          const maxQuantity = IssueMovementOrder.maxTroopQuantity(store.world, _selectedSourceCoords, troopId)
          if (quantity < 0) return setSelectedTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: 0 }))
          if (quantity > maxQuantity) return setSelectedTroopQuantity((prev: Record<string, number>) => ({ ...prev, [troopId]: maxQuantity }))
        })
      })
    })

    return <div>
      <label>From</label>
      <select value={selectedSourceCoords()} onChange={ev => setSelectedSourceCoords(ev.currentTarget.value)}>
        <For each={sourceFields()}>
          {f => <option value={f.coords}>{World_Field_KindToString(f.kind)} {f.coords}</option>}
        </For>
      </select>

      <p>Troops</p>
      <div>
        <For each={troops}>
          {t => {
            const maxQuantity = createMemo(() => IssueMovementOrder.maxTroopQuantity(store.world, selectedSourceCoords(), t.id))

            return <div>
              <span>{t.name} </span>
              <button onClick={() => setSelectedTroopQuantity(stq => ({ ...stq, [t.id]: maxQuantity() }))}>({maxQuantity()})</button>
              <input type="number" min={0} max={maxQuantity()}
                value={selectedTroopQuantity()[t.id] }
                onChange={ev => setSelectedTroopQuantity(stq => ({ ...stq, [t.id]: +ev.currentTarget.value }))}
              />
            </div>
          }}
        </For>
      </div>

      <p>Resources</p>
      <div>
        <div>
          <button onClick={() => setSelectedGold(maxGold())}>Gold ({maxGold()})</button>
          <input type="number" min={0} max={maxGold()}
            value={selectedGold()}
            onChange={ev => setSelectedGold(+ev.currentTarget.value)}
          />
        </div>
      </div>

      <button
        onClick={() => {
          issueMovementOrder(selectedSourceCoords(), targetField()!.coords, selectedTroopQuantity(), selectedGold())
          setSelectedTroopQuantity(newFieldTroops())
          setSelectedGold(0)
        }}
        disabled={countTroops(selectedTroopQuantity()) == 0}
      >
        {(targetField()!.playerId != store.playerId ) ? "Attack" : "Send"}
      </button>
    </div>
  }

  return <>
    <Switch>
      <Match when={targetField() == undefined}>
        <div><h2>No field selected</h2></div>
      </Match>
      <Match when={targetField()?.kind == serverV1.World_Field_Kind.FOG}>
        <Wrapper />
      </Match>
      <Match when={true}>
        <Wrapper>
          <Show when={sourceFields().length > 0}>
            <Targatable />
          </Show>
        </Wrapper>
      </Match>
    </Switch>
  </>
}

function Movements() {
  const orders = () => {
    const o = [...store.world.movementOrders]
    o.sort((a, b) => a.timeLeft - b.timeLeft)
    return o
  }

  return <div>
    <h2>Troop Movements</h2>
    <Show when={store.world.movementOrders.length > 0} fallback={<p>No movements</p>}>
      <div>
        <For each={orders()}>
          {order => {
            const sourceField = () => store.world.fields[order.sourceCoords]
            const [sourceX, sourceY] = order.sourceCoords.split('_').map(Number)
            const targetField = () => store.world.fields[order.targetCoords]
            const [targetX, targetY] = order.targetCoords.split('_').map(Number)
            const arrow = () => order.comeback ? "<-" : "->"
            const danger = () => order.playerId != store.playerId 

            return <div style={danger() ? "color:red" : undefined}>
              <A href={`/world/fields/${order.sourceCoords}`}>{World_Field_KindToString(sourceField().kind)} ({sourceX},{sourceY})</A>
              <span> {arrow()} </span>
              <A href={`/world/fields/${order.targetCoords}`}>{World_Field_KindToString(targetField().kind)} ({targetX},{targetY})</A>
              <span> - {order.timeLeft}s </span>
              <Show when={order.playerId == store.playerId  && !order.comeback}>
                <button onClick={() => cancelMovementOrder(order)}>Cancel</button>
              </Show>
            </div>
          }}
        </For>
      </div>
    </Show>
  </div>
}
