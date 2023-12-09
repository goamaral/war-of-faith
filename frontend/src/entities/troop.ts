import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Resources } from "."

export enum TroopKind {
  LEADER = "leader",
}

export default class Troop {
  kind: TroopKind
  name: string

  constructor(troop: serverV1Types.Troop) {
    this.kind = troop.kind as TroopKind
    this.name = troop.name
  }

  // TODO: Should come from the server
  trainCost(quantity: number): Resources {
    return new Resources({ time: 10, gold: 10 }).multiply(quantity)
  }
}