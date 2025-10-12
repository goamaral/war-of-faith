import { For } from 'solid-js'
import { A } from "@solidjs/router"

import { StoreLoader, playerVillages } from './store'

export default function VillagesPage() {
  return <StoreLoader>
    {() =>
      <div>
        <h1>Villages</h1>
        <ul>
          <For each={playerVillages()}>
            {v => <li><A href={`/villages/${v.coords}`}>Village {v.coords}</A></li>}
          </For>
        </ul>
      </div>
    }
  </StoreLoader>
}