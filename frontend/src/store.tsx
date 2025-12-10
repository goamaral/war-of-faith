import type { JSX } from "solid-js"
import { createStore } from "solid-js/store"
import { batch, onCleanup, onMount, Show } from "solid-js"
import { useNavigate } from "@solidjs/router"
import { toBinary, fromBinary } from "@bufbuild/protobuf"

import * as serverV1 from '../lib/protobuf/server/v1/server_pb'
import type { Mutator } from "./state/mutator"
import { serverCli } from './api'
import { transition } from "./state/transition"
import { encodeCoords } from "./state/helpers"
import { newWildField, newWorldHistory } from "./state/config"
import { assert, storeLogger } from "./logger"

const STATE_TRUNCATION_SIZE = 60
const STATE_LOCAL_STORAGE_KB_SIZE_LIMIT = 1024 // 1MB

let paused = false

type State = serverV1.World
let states = [] as State[]
let _statesLocked = false
function mutStates(fn: () => void) {
  assert(!_statesLocked, "States lock is free")
  _statesLocked = true

  try {
    fn()
  } catch (error) {
    throw error
  } finally {
    _statesLocked = false
  }
}

export const [store, setStore] = createStore({
  loaded: false,
  playerId: "",
  world: {} as serverV1.World,
})


function deepClone(obj: any) {
  return JSON.parse(JSON.stringify(obj))
}

declare global {
  interface Window {
    getStates: () => State[]
    resetState: () => void
    rollbackState: (tick: number) => void
  }
}
window.getStates = () => states
window.resetState = function() {
  localStorage.clear()
  location.reload()
}
window.rollbackState = function(tick: number) {
  assert(tick >= states[0].tick, `Rollback tick gte min (${states[0].tick})`)
  assert(tick <= states[states.length-1].tick, `Rollback tick lte max (${states[states.length-1].tick})`)
  
  mutStates(() => {
    states = states.slice(0, tick)
    setStore("world", deepClone(states[tick-1]))
    asyncSaveState()
  })
}

// Persistence
export function asyncSaveState() {
  setTimeout(() => {
    try {
      mutStates(() => {
        const localStorageKBSize = KBSizeOf(Object.values(localStorage))
        storeLogger(`localStorage size: ${localStorageKBSize}KB tick: ${states[states.length-1].tick}`)

        if (localStorageKBSize > STATE_LOCAL_STORAGE_KB_SIZE_LIMIT) {
          assert(states.length < STATE_TRUNCATION_SIZE, "Truncated states fit localStorage restrictions")

          states = states.slice(states.length - STATE_TRUNCATION_SIZE)
          storeLogger(`Truncated states ticks: (first: ${states[0].tick}, last: ${states[states.length-1].tick})`)
        }

        const bytes = toBinary(serverV1.WorldHistorySchema, newWorldHistory({ worlds: states }))
        let bytesString = ''
        for (let i = 0; i < bytes.length; i++) {
          bytesString += String.fromCharCode(bytes[i]);
        }
        localStorage.setItem("states", btoa(bytesString))
      })
    } catch (error) {
      console.error(error)
    }
  }, 0)

  return true
}
async function loadStore() {
  const statesB64 = localStorage.getItem("states")
  if (statesB64) {
    const bytes = Uint8Array.from(atob(statesB64), c => c.charCodeAt(0))
    states = fromBinary(serverV1.WorldHistorySchema, bytes).worlds
    const latestState = states[states.length - 1]
    setStore({
      loaded: true,
      playerId: "1",
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

    states = [deepClone({ ...world })]
    setStore({
      loaded: true,
      playerId: "1",
      world: world!,
    })
    asyncSaveState()
  }
}
function KBSizeOf(blobParts: BlobPart[]) {
  return (new Blob(blobParts).size / 1024)
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

      let stateLag = 0
      intervalId = setInterval(function() {
        function end() {
          clearInterval(intervalId)
          window.resetState()
        }

        if (_statesLocked || paused) {
          stateLag++
          return
        }

        let ended = false
        mutStates(() => {
          while (stateLag > 0) {
            const ended = batch(() => transition(store.world, mutator))
            if (ended) return end()
            stateLag--
          }

          ended = batch(() => transition(store.world, mutator))
          states.push(deepClone(store.world))
        })

        if (ended) return end()
        asyncSaveState()
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
  setTick: (set) => { setStore("world", "tick", set); return store.world },
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