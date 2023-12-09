import { BuildingUpgradeOrder, Village } from "."
import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

import Resources from "./resources"

export enum BuildingUpgradeStatus {
  UPGRADABLE = 1,
  MAX_LEVEL = 2,
  INSUFFICIENT_RESOURCES = 3,
}

export default class Building {
  id: number
  kind: serverV1Types.Building_Kind
  name: string
  level: number

  village: Village

  constructor(building: serverV1Types.Building, village: Village) {
    this.id = building.id
    this.kind = building.kind
    this.name = building.name
    this.level = building.level

    this.village = village
  }

  // TODO: Should come from the server
  upgradeCost(/* level: number */): Resources {
    return new Resources({ time: 10, gold: 10 }) 
  }

  // TODO: Should come from the server
  get maxLevel(): number {
    return 10
  }

  get nextLevel(): number {
    return this.level + this.upgradeOrders.length + 1
  }

  // TODO: Move to village
  get upgradeOrders(): BuildingUpgradeOrder[] {
    return this.village.buildingUpgradeOrders.filter(o => o.buildingId === this.id)
  }

  // TODO: Move to village
  upgradeStatus(): BuildingUpgradeStatus {
    if (this.nextLevel > this.maxLevel) return BuildingUpgradeStatus.MAX_LEVEL
    if (!this.village.canAfford(this.upgradeCost())) return BuildingUpgradeStatus.INSUFFICIENT_RESOURCES
    return BuildingUpgradeStatus.UPGRADABLE
  }
}