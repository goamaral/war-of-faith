import * as serverV1 from '../lib/protobuf/server/v1/server_pb'

import { store } from './store'

export const LEADER = "leader" // TODO: Rename to KNIGHT

export const goldPerUnit = 10

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
    ...v,
    buildingUpgradeOrders: [],
    troopTrainingOrders: [],
  } as serverV1.Village
}

export function newWildField(coords: string, v: Partial<serverV1.World_Field> = {}) {
  return {
    coords,
    kind: serverV1.World_Field_Kind.WILD,
    buildings: { [HALL]: 1, [GOLD_MINE]: 0 },
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

export function newFieldTroops() {
  const troops = {} as Record<string, number>
  for (const troopId in store.world.troops) {
    troops[troopId] = 0
  }
  return troops
}

export function countTroops(troops: Record<string, number>) {
  return Object.values(troops).reduce((a, b) => a + b, 0)
}