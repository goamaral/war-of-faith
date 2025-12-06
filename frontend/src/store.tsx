import type { JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { batch, onCleanup, onMount, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import type { Mutator } from "./state/mutator"
import { serverCli } from './api'
import { tick } from "./state/tick"
import { encodeCoords } from "./state/helpers"
import { newWildField } from "./state/config"

type State = serverV1.World

export const [store, setStore] = createStore({
  loaded: false,
  playerId: "",
  states: [] as State[],
  world: {} as serverV1.World,
})

let paused = false

function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

declare global {
  interface Window {
    resetState: () => void
    rollbackState: (tick: number) => void
  }
}
window.resetState = function() {
  localStorage.removeItem("state_history")
  location.reload()
}
window.rollbackState = function(tick: number, reload = false) {
  if (tick <= 1) return

  paused = true
  setStore(store => {
    return {
      ...store,
      states: store.states.slice(0, tick),
      world: deepClone(store.states[tick-1]),
    }
  })
  saveState()
  paused = false
}

// Persistence
export function saveState() {
  localStorage.setItem("state_history", JSON.stringify(store.states))
}
async function loadStore() {
  const statesJson = localStorage.getItem("state_history")
  if (statesJson) {
    const states = JSON.parse(statesJson)
    const latestState = states[states.length - 1]
    setStore({
      loaded: true,
      playerId: "1",
      states,
      world: deepClone(latestState),
    })

  } else {
    const { world } = await serverCli.getWorld({})
    for (let x = 0; x < world!.width; x++) {
      for (let y = 0; y < world!.height; y++) {
        const coords = encodeCoords(x, y)
        if (world!.fields[coords] == undefined) {
          world!.fields[coords] = newWildField(coords)
        }
      }
    }

    setStore({
      loaded: true,
      playerId: "1",
      states: [deepClone(world!)],
      world: world!,
    })
    localStorage.setItem("state_history", JSON.stringify(store.states))
  }
}

export function StoreLoader({ children }: { children: () => JSX.Element }) {
  const navigate = useNavigate()
  const handleKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT') return
    if (e.key === 'p') { paused = true; return }
    if (e.key === 'w') return navigate('/world')
    if (e.key === 'v') return navigate('/villages')
    const villageNumber = Number.parseInt(e.key)
    if (Number.isInteger(villageNumber)) {
      const villageIndex = (villageNumber == 0 ? 10 : villageNumber)-1
      const villageCoords = store.world.players[store.playerId].villageKeyBindings[villageIndex]
      if (villageCoords) return navigate(`/world/${villageCoords}`)
    }
  }

  onMount(() => {
    let intervalId = undefined as undefined | number
    async function setup() {
      if (!store.loaded) await loadStore()

      // async function subscribeToWorld() {
      //   try {
      //     for await (const { patch } of serverCli.subscribeToWorld({})) {
      //       applyWorldPatch(patch!)
      //     }
      //   } catch (err) {
      //     alert(`Failed to subscribe to world: ${err}`)
      //     subscribeToWorld()
      //   }
      // }
      // subscribeToWorld()

      intervalId = setInterval(function() {
        if (paused) return
        const ended = batch(() => tick(store.world, mutator))
        if (ended) {
          clearInterval(intervalId)
          window.resetState()
        } else {
          setStore("states", states => [...states, deepClone(store.world)])
          saveState()
        }
      }, 1000)
      document.addEventListener('keydown', handleKeyDown)
    }
    setup()

    onCleanup(() => clearInterval(intervalId))
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown))
  })

  return <Show when={store.loaded} fallback={<p>Loading...</p>} keyed>
    {(_) => children()}
  </Show>
}

//   applyWorldPatch(patch: serverV1.SubscribeToWorldResponse_Patch) {
//     const { world } = get()
//     world.fields = patch.fields

//     set(() => ({
//       world,
//       villages: Object.fromEntries(Object.entries(patch.villages).map(([k, v]) => [k, new entities.Village(v)])),
//       // temples
//       attacks: patch.attacks,
//     }))

export const mutator: Mutator = {
  setMovementOrders: (set) => { setStore("world", "movementOrders", set); return store.world },

  setField: (coords, set) => { setStore("world", "fields", coords, set); return store.world },
  setFieldTroops: (coords, set) => { setStore("world", "fields", coords, "troops", set); return store.world },
  setFieldResources: (coords, set) => { setStore("world", "fields", coords, "resources", r => set(r!)); return store.world },
  setFieldBuidingLevels: (coords, set) => { setStore("world", "fields", coords, "buildingLevels", set); return store.world },

  setPlayerVillageKeyBindings: (coords, set) => { setStore("world", "players", coords, "villageKeyBindings", set); return store.world },

  setVillage: (coords, set) => { setStore("world", "villages", coords, set); return store.world },
  setVillageBuildingUpgradeOrders: (coords, set) => { setStore("world", "villages", coords, "buildingUpgradeOrders", set); return store.world },
  setVillageTrainingOrders: (coords, set) => { setStore("world", "villages", coords, "trainingOrders", set); return store.world },

  setTemple: (coords, set) => { setStore("world", "temples", coords, set); return store.world },
}