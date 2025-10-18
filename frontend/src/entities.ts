import * as serverV1 from '../lib/protobuf/server/v1/server_pb'

import { store } from './store'

export const LEADER = "leader" // TODO: Rename to KNIGHT

export const HALL = "hall"
export const GOLD_MINE = "gold-mine"

export function newVillage(v: Partial<serverV1.Village> = {}) {
  return {
    ...v,
    buildingUpgradeOrders: [],
    troopTrainingOrders: [],
  } as serverV1.Village
}

export function newWildField(coords: string, v: Partial<serverV1.World_Field> = {}) {
  return {
    ...v,
    coords,
    kind: serverV1.World_Field_Kind.WILD,
    buildings: {},
    troops: newFieldTroops(),
    resources: newResources(),
  }
}

export function newResources(v: Partial<serverV1.Resources> = {}) {
  return {
    ...v,
    gold: 0,
    time: 0,
  } as serverV1.Resources
}

export function newFieldTroops() {
  const troops = {} as Record<string, number>
  for (const troopId in store.world.troops) {
    troops[troopId] = 0
  }
  return troops
}