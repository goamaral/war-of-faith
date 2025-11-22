import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'
import { setStore } from "../store"

type Setter<T> = (t: T) => T

export interface Mutator {
  setFieldTroops: (coords: string, set: Setter<Record<string, number>>) => void
  setFieldGold: (coords: string, set: Setter<number>) => void
  setMovementOrders: (set: Setter<serverV1.MovementOrder[]>) => void
}