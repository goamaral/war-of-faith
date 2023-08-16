import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Resources, Village } from "."

export enum TroopTrainStatus {
  TRAINABLE = 0,
  NOT_ENOUGH_RESOURCES = 1,
  NO_MORE_LEADERS = 2,
}

export default class Troop {
  id: number
  kind: serverV1Types.Troop_Kind
  name: string
  troopTrainCost: Resources
  quantity: number

  village: Village

  constructor(troop: serverV1Types.Troop, village: Village) {
    this.id = troop.id
    this.kind = troop.kind
    this.name = troop.name
    this.troopTrainCost = new Resources(troop.trainCost!)
    this.quantity = troop.quantity

    this.village = village
  }

  trainCost(quantity: number): Resources {
    return this.troopTrainCost.multiply(quantity)
  }

  trainStatus(quantity: number): TroopTrainStatus {
    if (this.kind == serverV1Types.Troop_Kind.LEADER && this.village.trainableLeaders == 0) return TroopTrainStatus.NO_MORE_LEADERS
    if (!this.village.canAfford(this.trainCost(quantity))) return TroopTrainStatus.NOT_ENOUGH_RESOURCES

    return TroopTrainStatus.TRAINABLE
  }
}