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

export const [store, setStore] = createStore({
  loaded: false,
  world: {} as serverV1.World,
  playerId: "",
})

declare global {
  interface Window {
    resetStore: () => void
  }
}
window.resetStore = function() {
  localStorage.removeItem("store")
  location.reload()
}

// Persistence
export function persistStore() {
  localStorage.setItem("store", JSON.stringify(store))
}
async function loadStore() {
  const persistedStore = localStorage.getItem("store")
  if (persistedStore) {
    const store = JSON.parse(persistedStore)
    setStore(store)

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

    const store = { loaded: true, world, playerId: "1" }
    setStore(store)
    localStorage.setItem("store", JSON.stringify(store))
  }
}

export function StoreLoader({ children }: { children: () => JSX.Element }) {
  const navigate = useNavigate()
  const handleKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement?.tagName === 'INPUT') return
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
        const ended = batch(() => tick(store.world, mutator))
        ended ? clearInterval(intervalId) : persistStore()
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