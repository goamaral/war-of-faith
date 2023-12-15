import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

export enum TroopTrainingStatus {
  TRAINABLE = 0,
  INSUFFICIENT_RESOURCES = 1,
  MAX_TRAINABLE = 2,
}

export enum TroopKind {
  LEADER = "leader",
}

export default class Troop extends serverV1Types.Troop {
  cost: serverV1Types.Resources = new serverV1Types.Resources({ time: 10, gold: 10 }) // TODO: Should come from the server

  trainCost(quantity: number): serverV1Types.Resources {
    return new serverV1Types.Resources({
      time: this.cost.time * quantity,
      gold: this.cost.gold * quantity,
    })
  }
}