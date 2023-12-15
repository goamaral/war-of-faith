import * as serverV1 from "../../lib/protobuf/server/v1/server_pb"

export enum BuildingUpgradeStatus {
  UPGRADABLE = 1,
  MAX_LEVEL = 2,
  INSUFFICIENT_RESOURCES = 3,
}

export enum BuildingKind {
  HALL = "hall",
  GOLD_MINE = "gold-mine",
}

export default class Building extends serverV1.Building {
  maxLevel: number = 10 // TODO: Should come from the server
  cost: serverV1.Resources = new serverV1.Resources({ time: 10, gold: 10 }) // TODO: Should come from the server
  
  upgradeCost(_level: number): serverV1.Resources {
    return this.cost
  }
}