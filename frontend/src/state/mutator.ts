import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'

type Setter<T> = (t: T) => T

export interface Mutator {
  setMovementOrders: (set: Setter<serverV1.MovementOrder[]>) => serverV1.World

  setField: (coords: string, set: Setter<serverV1.World_Field>) => serverV1.World
  setFieldTroops: (coords: string, set: Setter<Record<string, number>>) => serverV1.World
  setFieldResources: (coords: string, set: Setter<serverV1.Resources>) => serverV1.World
  setFieldBuidingLevels: (coords: string, set: Setter<Record<string, number>>) => serverV1.World

  setPlayerVillageKeyBindings: (coords: string, set: Setter<string[]>) => serverV1.World

  setVillage: (coords: string, set: Setter<serverV1.Village>) => serverV1.World
  setVillageBuildingUpgradeOrders: (coords: string, set: Setter<serverV1.Village_BuildingUpgradeOrder[]>) => serverV1.World
  setVillageTrainingOrders: (coords: string, set: Setter<serverV1.Village_TrainingOrder[]>) => serverV1.World
  
  setTemple(coords: string, set: Setter<serverV1.Temple>): serverV1.World
}