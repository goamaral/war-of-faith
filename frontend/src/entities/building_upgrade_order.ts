import { Resources, Village, Building } from "."
import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"

export default class BuildingUpgradeOrder {
  id: number
  level: number
  timeLeft: number
  cost: Resources
  buildingId: number

  village: Village

  constructor(order: serverV1Types.Building_UpgradeOrder, village: Village) {
    this.id = order.id
    this.level = order.level
    this.timeLeft = order.timeLeft
    this.cost = new Resources(order.cost!)
    this.buildingId = order.buildingId

    this.village = village
  }

  get building(): Building {
    return this.village.buildings.find(b => b.id === this.buildingId)!
  }
}