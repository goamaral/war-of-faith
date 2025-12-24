import { For, JSX, createMemo, onCleanup, onMount } from "solid-js"
import { togglePaused, store, StoreLoader } from "./store"
import { action, useNavigate } from "@solidjs/router"

export default function GamePageWrapper({ children }: { children: JSX.Element | (() => JSX.Element) }) {
  return <StoreLoader>
    {() => {
      const player = () => store.world.players[store.playerId]
      const villageBindings = () => player().villageKeyBindings

      const navigate = useNavigate()
      const keyBindings = createMemo(() => [
        // { key: 'p', description: 'Pause', action: () => togglePaused() },
        { key: 'w', description: 'World', action: () => navigate('/world') },
        { key: 'v', description: 'Villages', action: () => navigate('/villages') },
        ...Array.from({ length: 10 }, (_, i) => {
          const num = i == 9 ? 0 : i + 1
          const coords = villageBindings()[i]
          return {
            key: num.toString(),
            description: coords ? coords : 'Free',
            action: () => coords ? navigate(`/world/${coords}`) : undefined,
          }
        })
      ])

      onMount(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (document.activeElement?.tagName === 'INPUT') return
          keyBindings().find(b => b.key == e.key)?.action?.()
        }

        document.addEventListener('keydown', handleKeyDown)

        onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
      })

      return <div class="flex flex-col h-screen">
        <div class="text-whitetext-sm flex flex-row gap-10 mx-auto">
          <For each={keyBindings()}>
            {binding => <span>[{binding.key.toUpperCase()}] {binding.description}</span>}
          </For>
        </div>

        <div>
          {typeof children === 'function' ? children() : children}
        </div>
      </div>
    }}
  </StoreLoader>
}
