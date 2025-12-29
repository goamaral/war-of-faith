import { create, MessageInitShape } from '@bufbuild/protobuf'
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

export function newWorldHistory(v: MessageInitShape<typeof serverV1.WorldHistorySchema> = {}) {
  return create(serverV1.WorldHistorySchema, {
    worlds: [],
    ...v,
  })
}

export function newVillage(v: MessageInitShape<typeof serverV1.VillageSchema> = {}) {
  return create(serverV1.VillageSchema, {
    buildingUpgradeOrders: [],
    trainingOrders: [],
    ...v,
  })
}

export function newWildField(coords: string, v: MessageInitShape<typeof serverV1.World_FieldSchema> = {}) {
  return create(serverV1.World_FieldSchema, {
    coords,
    kind: serverV1.World_Field_Kind.WILD,
    buildingLevels: newFieldBuildingLevels({ [HALL]: 1 }),
    troops: newFieldTroops(),
    resources: newResources(),
    ...v,
  })
}

export function newResources(v: MessageInitShape<typeof serverV1.ResourcesSchema> = {}) {
  return create(serverV1.ResourcesSchema, {
    gold: 0,
    time: 0,
    ...v,
  })
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

export function newMovementOrder(v: MessageInitShape<typeof serverV1.MovementOrderSchema> = {}) {
  return create(serverV1.MovementOrderSchema, v)
}

export function newVillage_TrainingOrder(v: MessageInitShape<typeof serverV1.Village_TrainingOrderSchema> = {}) {
  return create( serverV1.Village_TrainingOrderSchema, v)
}

export function newVillage_BuildingUpgradeOrder(v: MessageInitShape<typeof serverV1.Village_BuildingUpgradeOrderSchema> = {}) {
  return create( serverV1.Village_BuildingUpgradeOrderSchema, v)
}