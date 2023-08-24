import { Village } from "."
import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

import Resources from "./resources"

export enum BuildingUpgradeStatus {
  UPGRADABLE = 1,
  MAX_LEVEL = 2,
  INSUFFICIENT_RESOURCES = 3,
  UPGRADING = 4
}

export default class Building {
  id: number
  kind: serverV1Types.Building_Kind
  name: string
  level: number
  upgradeTimeLeft: number

  village: Village

  constructor(building: serverV1Types.Building, village: Village) {
    this.id = building.id
    this.kind = building.kind
    this.name = building.name
    this.level = building.level
    this.upgradeTimeLeft = building.upgradeTimeLeft

    this.village = village
  }

  // TODO: Should come from the server
  // TODO: Apply hall bonus
  get upgradeCost(): Resources {
    return new Resources({ time: 10, gold: 10 }) 
  }

  // TODO: Should come from the server
  get maxLevel(): number {
    return 10
  }

  upgradeStatus(): BuildingUpgradeStatus {
    if (this.upgradeTimeLeft > 0) return BuildingUpgradeStatus.UPGRADING
    if (this.level >= this.maxLevel) return BuildingUpgradeStatus.MAX_LEVEL
    if (!this.village.canAfford(this.upgradeCost)) return BuildingUpgradeStatus.INSUFFICIENT_RESOURCES
    return BuildingUpgradeStatus.UPGRADABLE
  }
}