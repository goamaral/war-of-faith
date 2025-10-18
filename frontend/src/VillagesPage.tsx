import { For } from 'solid-js'
import { A } from "@solidjs/router"

import { StoreLoader, playerVillageFields } from './store'

export default function VillagesPage() {
  return <StoreLoader>
    {() =>
      <div>
        <h1>Villages</h1>
        <ul>
          <For each={playerVillageFields()}>
            {f => <li><A href={`/villages/${f.coords}`}>fillage {f.coords}</A></li>}
          </For>
        </ul>
      </div>
    }
  </StoreLoader>
}