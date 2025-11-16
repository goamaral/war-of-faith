import * as serverV1 from '../lib/protobuf/server/v1/server_pb'

import { store } from './store'

export const LEADER = "leader" // TODO: Rename to KNIGHT
export const RAIDER = "raider"

export const carriableGoldPerUnit = 10

export const HALL = "hall"
export const GOLD_MINE = "gold-mine"

export function World_Field_KindToString(entityKind: serverV1.World_Field_Kind): string {
  switch (entityKind) {
    case serverV1.World_Field_Kind.VILLAGE:
      return 'Village'

    case serverV1.World_Field_Kind.TEMPLE:
      return 'Temple'

    default:
      return 'Wild Field'
  }
}

export function newVillage(v: Partial<serverV1.Village> = {}) {
  return {
    buildingUpgradeOrders: [],
    troopTrainingOrders: [],
    ...v,
  } as serverV1.Village
}

export function newWildField(coords: string, v: Partial<serverV1.World_Field> = {}, buildingIds: string[] = Object.keys(store.world.buildings)) {
  return {
    coords,
    kind: serverV1.World_Field_Kind.WILD,
    buildings: newFieldBuildings({ [HALL]: 1 }, buildingIds),
    troops: newFieldTroops(),
    resources: newResources(),
    ...v,
  } as serverV1.World_Field
}

export function newResources(v: Partial<serverV1.Resources> = {}) {
  return {
    gold: 0,
    time: 0,
    ...v,
  } as serverV1.Resources
}

function newFieldBuildings(v: Partial<Record<string, number>> = {}, buildingIds: string[] = Object.keys(store.world.buildings)) {
  const buildings = {} as Record<string, number>
  for (const buildingId of buildingIds) {
    buildings[buildingId] = v[buildingId] || 0
  }
  return buildings
}

export function newFieldTroops(v: Partial<Record<string, number>> = {}) {
  const troops = {} as Record<string, number>
  for (const troopId in store.world.troops) {
    troops[troopId] = v[troopId] || 0
  }
  return troops
}

export function countTroops(troops: Record<string, number>) {
  return Object.values(troops).reduce((a, b) => a + b, 0)
}