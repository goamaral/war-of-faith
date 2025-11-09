import { Accessor, For, Match, Switch, Show } from "solid-js"
import { store, StoreLoader, playerId } from "./store"
import { useParams } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import Village from "./world_field_page/Village"
import { World_Field_KindToString } from "./entities"

export default function WorldFieldPage() {
  const { coords } = useParams() as { coords: string }

  return <StoreLoader>
    {() => {
      const field = () => store.world.fields[coords]

      return <Switch fallback={<div>{World_Field_KindToString(field().kind)} {coords}</div>}>
        <Match when={field().kind == serverV1.World_Field_Kind.VILLAGE}>
          <Village field={field} />
        </Match>
        <Match when={field().kind == serverV1.World_Field_Kind.TEMPLE}>
          <Temple field={field} />
        </Match>
      </Switch>
    }}
  </StoreLoader>
}

function Temple({ field }: { field: Accessor<serverV1.World_Field> }) {
  return <div>
    <div>Temple</div>
    <Show when={field().playerId == playerId}>
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
                const troop = store.world.troops[troopId]
                const quantity = () => field().troops[troopId]
                return <li>{troop.name} - {quantity()} units</li>
              }}
          </For>
        </ul>
      </div>
    </Show>
  </div>
}