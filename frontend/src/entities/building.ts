import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

import Resources from "./resources"

export default class Building {
  id: number
  kind: serverV1Types.Building_Kind
  name: string
  level: number
  upgradeStatus: serverV1Types.Building_UpgradeStatus
  upgradeTimeLeft: number
  upgradeCost: Resources

  constructor(building: serverV1Types.Building) {
    this.id = building.id
    this.kind = building.kind
    this.name = building.name
    this.level = building.level
    this.upgradeStatus = building.upgradeStatus
    this.upgradeTimeLeft = building.upgradeTimeLeft
    this.upgradeCost = new Resources(building.upgradeCost!)
  }
}