import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { setStore } from "../store"

type Setter<T> = (t: T) => T

export interface Mutator {
  setMovementOrders: (set: Setter<serverV1.MovementOrder[]>) => void
  setFieldTroops: (coords: string, set: Setter<Record<string, number>>) => void
  setFieldResources: (coords: string, set: Setter<serverV1.Resources>) => void

  setVillageBuildingUpgradeOrders: (coords: string, set: Setter<serverV1.Village_BuildingUpgradeOrder[]>) => void
}