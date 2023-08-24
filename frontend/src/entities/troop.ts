import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Resources, Village } from "."

export enum TroopTrainStatus {
  TRAINABLE = 0,
  INSUFFICIENT_RESOURCES = 1,
  MAX_LEADERS = 2,
}

export default class Troop {
  id: number
  kind: serverV1Types.Troop_Kind
  name: string
  quantity: number

  village: Village

  constructor(troop: serverV1Types.Troop, village: Village) {
    this.id = troop.id
    this.kind = troop.kind
    this.name = troop.name
    this.quantity = troop.quantity

    this.village = village
  }

  // TODO: Should come from the server
  // TODO: Apply barracks bonus
  trainCost(quantity: number): Resources {
    return new Resources({ time: 10, gold: 10 }).multiply(quantity)
  }

  trainStatus(quantity: number): TroopTrainStatus {
    if (this.kind == serverV1Types.Troop_Kind.LEADER && this.village.trainableLeaders == 0) return TroopTrainStatus.MAX_LEADERS
    if (!this.village.canAfford(this.trainCost(quantity))) return TroopTrainStatus.INSUFFICIENT_RESOURCES
    return TroopTrainStatus.TRAINABLE
  }
}