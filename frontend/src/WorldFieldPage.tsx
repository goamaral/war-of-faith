import { Accessor, For, Match, Switch, Show, onMount, onCleanup, createMemo } from "solid-js"
import { store, StoreLoader } from "./store"
import { useParams } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import Village from "./world_field_page/Village"
import { World_Field_KindToString } from "./state/config"

export default function WorldFieldPage() {
  const params = useParams() as { coords: string }

  return <StoreLoader>
    {() => {
      const field = () => store.world.fields[params.coords]!

      return <div>
        <h1>{World_Field_KindToString(field().kind)}</h1>
        <div>Coords: {field().coords}</div>
        <div>Player: {field().playerId || "None"}</div>
        <Switch>
          <Match when={field().kind == serverV1.World_Field_Kind.VILLAGE}>
            <Village field={field} />
          </Match>
          <Match when={field().kind == serverV1.World_Field_Kind.TEMPLE}>
            <Temple field={field} />
          </Match>
        </Switch>
      </div>
    }}
  </StoreLoader>
}

function Temple({ field }: { field: Accessor<serverV1.World_Field> }) {
  return <Show when={field().playerId == store.playerId}>
    <div>
      <h2>Resources</h2>
      <ul>
        <li>{field().resources!.gold} Gold</li>
      </ul>
    </div>
    <div>
      <h2>Troops</h2>
      <ul>
        <For each={Object.keys(store.world.troops)}>
          {(troopId) => {
              const troop = () => store.world.troops[troopId]
              const quantity = () => field().troops[troopId]
              return <li>{troop().name} - {quantity()} units</li>
            }}
        </For>
      </ul>
    </div>
  </Show>
}
