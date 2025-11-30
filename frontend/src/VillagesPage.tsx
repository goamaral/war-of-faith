import { For } from 'solid-js'
import { A } from "@solidjs/router"

import { store, StoreLoader } from './store'
import { playerVillageFields } from './state/helpers'

export default function VillagesPage() {
  return <StoreLoader>
    {() =>
      <div>
        <h1>Villages</h1>
        <ul>
          <For each={playerVillageFields(store.world, store.playerId)}>
            {f => <li><A href={`/world/${f.coords}`}>village {f.coords}</A></li>}
          </For>
        </ul>
      </div>
    }
  </StoreLoader>
}
