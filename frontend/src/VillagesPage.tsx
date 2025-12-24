import { For } from 'solid-js'
import { A } from "@solidjs/router"

import { store } from './store'
import { playerVillageFields } from './state/helpers'
import GamePageWrapper from './GamePageWrapper'

export default function VillagesPage() {
  return <GamePageWrapper>
    {() => (
      <div>
        <h1>Villages</h1>
        <ul>
          <For each={playerVillageFields(store.world, store.playerId)}>
            {f => <li><A href={`/world/${f.coords}`}>village {f.coords}</A></li>}
          </For>
        </ul>
      </div>
    )}
  </GamePageWrapper>
}
