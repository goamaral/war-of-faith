import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'

export const CARRIABLE_GOLD_PER_UNIT = 10

export const LEADER = "leader" // TODO: Rename to KNIGHT
export const RAIDER = "raider"
export const TROOP_IDS = [LEADER, RAIDER]

export const HALL = "hall"
export const GOLD_MINE = "gold-mine"
export const BUILDING_IDS = [HALL, GOLD_MINE]

export const WIN_CONDITION_OWNERSHIP_AGE_SECS = 1*60 // 5 min

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

export function newWildField(coords: string, v: Partial<serverV1.World_Field> = {}) {
  return {
    coords,
    kind: serverV1.World_Field_Kind.WILD,
    buildingLevels: newFieldBuildingLevels({ [HALL]: 1 }),
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

function newFieldBuildingLevels(v: Partial<Record<string, number>> = {}) {
  const lvls = {} as Record<string, number>
  for (const buildingId of BUILDING_IDS) {
    lvls[buildingId] = v[buildingId] || 0
  }
  return lvls
}

export function newFieldTroops(v: Partial<Record<string, number>> = {}) {
  const troops = {} as Record<string, number>
  for (const troopId of TROOP_IDS) {
    troops[troopId] = v[troopId] || 0
  }
  return troops
}