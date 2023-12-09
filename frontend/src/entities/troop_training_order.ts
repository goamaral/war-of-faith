import { Resources, TroopKind, Village } from "."
import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

export default class TroopTrainingOrder {
  id: number
  quantity: number
  timeLeft: number
  cost: Resources
  troopKind: TroopKind

  village: Village

  constructor(order: serverV1Types.Troop_TrainingOrder, village: Village) {
    this.id = order.id
    this.quantity = order.quantity
    this.timeLeft = order.timeLeft
    this.cost = new Resources(order.cost!)
    this.troopKind = order.troopKind as TroopKind

    this.village = village
  }
}