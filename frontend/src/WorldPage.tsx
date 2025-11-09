import type { JSX, ParentProps } from "solid-js"

import {
  createSignal, Accessor, Setter,
  Show, For, Switch, Match,
  createEffect
} from "solid-js"
import { useNavigate, A } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import {
  StoreLoader, store, playerId, decodeCoords,
  issueMovementOrder, cancelMovementOrder,
  playerFields,
} from './store'
import { countTroops, carriableGoldPerUnit, newFieldTroops, World_Field_KindToString } from "./entities"

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


  const cells = () => {
    const fields = Array(store.world.width).fill(undefined)
    fields.forEach((_, y) => fields[y] = Array(store.world.height).fill(undefined))
    for (const coords in store.world.fields) {
      const { x, y } = decodeCoords(coords)
      fields[y][x] = store.world.fields[coords]
    }
    return fields.flat()
  }

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
        return { 'background-color': field.playerId == playerId ? 'green' : 'red' }

      case serverV1.World_Field_Kind.TEMPLE:
        let color = "yellow"
        if (field.playerId) {
          color = field.playerId == playerId ? "yellowgreen" : "lightsalmon	"
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

  const sourceFields = () => playerFields(f => f.coords != targetField()!.coords).sort((a, b) => countTroops(b.troops) - countTroops(a.troops)) // TODO: Sort by distance or power
  
  function Targatable() {
    const [selectedSourceCoords, setSelectedSourceCoords] = createSignal(sourceFields()[0].coords)
    createEffect(() => setSelectedSourceCoords(sourceFields()[0].coords))
    const selectedField = () => store.world.fields[selectedSourceCoords()]
    
    const troops = () => Object.values(store.world.troops)
    const [selectedTroopQuantity, setSelectedTroopQuantity] = createSignal(newFieldTroops())

    const maxGold = () => Math.min(selectedField().resources!.gold, countTroops(selectedTroopQuantity()) * carriableGoldPerUnit)
    const [selectedGold, setSelectedGold] = createSignal(0)

    return <div>
      <label>From</label>
      <select value={selectedSourceCoords()} onChange={ev => setSelectedSourceCoords(ev.currentTarget.value)}>
        <For each={sourceFields()}>
          {f => <option value={f.coords}>{World_Field_KindToString(f.kind)} {f.coords}</option>}
        </For>
      </select>

      <p>Troops</p>
      <div>
        <For each={troops()}>
          {t => {
            const maxQuantity = () => selectedField().troops[t.id]

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
        {(targetField()!.playerId != playerId) ? "Attack" : "Send"}
      </button>
    </div>
  }

  return <>
    <Switch fallback={
      <Wrapper>
        <Show when={sourceFields().length > 0}>
          <Targatable />
        </Show>
      </Wrapper>
    }>
      <Match when={targetField() == undefined}>
        <div><h2>No field selected</h2></div>
      </Match>
      <Match when={targetField()?.kind == serverV1.World_Field_Kind.FOG}>
        <Wrapper />
      </Match>
    </Switch>
  </>
}

enum TroopMovementType {
  Outgoing,
  Incoming,
  Support,
}

function Movements() {
  function Movements({ type }: {type: TroopMovementType}) {
    const orders = () => store.world.movementOrders.filter(o => {
      const sourcePlayerId = store.world.fields[o.sourceCoords].playerId
      const targetPlayerId = store.world.fields[o.targetCoords].playerId

      switch (type) {
        case TroopMovementType.Outgoing:
          return sourcePlayerId == playerId && targetPlayerId != playerId
        case TroopMovementType.Incoming:
          return sourcePlayerId != playerId && targetPlayerId == playerId
        case TroopMovementType.Support:
          return sourcePlayerId == playerId && targetPlayerId == playerId
      }
    })

    const title = () => {
      switch (type) {
        case TroopMovementType.Outgoing:
          return "Outgoing"
        case TroopMovementType.Incoming:
          return "Incoming"
        case TroopMovementType.Support:
          return "Support"
      }
    }

    return <>
      <h3>{title()}</h3>
      <Show when={orders().length > 0} fallback={<p>No movements</p>}>
        <div>
          <For each={orders()}>
            {order => {
              const sourceField = () => store.world.fields[order.sourceCoords]
              const [sourceX, sourceY] = order.sourceCoords.split('_').map(Number)
              const targetField = () => store.world.fields[order.targetCoords]
              const [targetX, targetY] = order.targetCoords.split('_').map(Number)
              const arrow = () => order.comeback ? "<-" : "->"

              return (<div>
                <A href={`/world/fields/${order.sourceCoords}`}>{World_Field_KindToString(sourceField().kind)} ({sourceX},{sourceY})</A>
                <span> {arrow()} </span>
                <A href={`/world/fields/${order.targetCoords}`}>{World_Field_KindToString(targetField().kind)} ({targetX},{targetY})</A>
                <span> - {order.timeLeft}s </span>
                <Show when={type != TroopMovementType.Incoming && !order.comeback}>
                  <button onClick={() => cancelMovementOrder(order)}>Cancel</button>
                </Show>
              </div>)
            }}
          </For>
        </div>
      </Show>
    </>
  }

  return <div>
    <h2>Troop Movements</h2>
    <Movements type={TroopMovementType.Outgoing} />
    <Movements type={TroopMovementType.Incoming} />
    <Movements type={TroopMovementType.Support} />
  </div>
}