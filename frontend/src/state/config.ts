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

export function newWorldHistory(v: Partial<serverV1.WorldHistory> = {}) {
  return {
    $typeName: "server.v1.WorldHistory",
    worlds: [],
    ...v,
  } as serverV1.WorldHistory
}

export function newVillage(v: Partial<serverV1.Village> = {}) {
  return {
    $typeName: "server.v1.Village",
    buildingUpgradeOrders: [],
    trainingOrders: [],
    ...v,
  } as serverV1.Village
}

export function newWildField(coords: string, v: Partial<serverV1.World_Field> = {}) {
  return {
    $typeName: "server.v1.World.Field",
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
    $typeName: "server.v1.Resources",
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

export function newMovementOrder(v: Partial<serverV1.MovementOrder> = {}) {
  return {
    $typeName: "server.v1.MovementOrder",
    ...v,
  } as serverV1.MovementOrder
}

export function newVillage_TrainingOrder(v: Partial<serverV1.Village_TrainingOrder> = {}) {
  return {
    $typeName: "server.v1.Village.TrainingOrder",
    ...v,
  } as serverV1.Village_TrainingOrder
}

export function newVillage_BuildingUpgradeOrder(v: Partial<serverV1.Village_BuildingUpgradeOrder> = {}) {
  return {
    $typeName: "server.v1.Village.BuildingUpgradeOrder",
    ...v,
  } as serverV1.Village_BuildingUpgradeOrder
}