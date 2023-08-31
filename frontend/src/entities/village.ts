import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building, Troop, Resources, TroopTrainingOrder, BuildingUpgradeOrder } from "."

export default class Village {
  id: number
  gold: number

  buildings: Building[]
  buildingUpgradeOrders: BuildingUpgradeOrder[]
  troops: Troop[]
  troopTrainingOrders: TroopTrainingOrder[]

  constructor(village: serverV1Types.Village) {
    this.id = village.id
    this.gold = village.resources?.gold!
    this.buildings = village.buildings.map(b => new Building(b, this))
    this.buildingUpgradeOrders = village.buildingUpgradeOrders.map(o => new BuildingUpgradeOrder(o, this))
    this.troops = village.troops.map(t => new Troop(t, this))
    this.troopTrainingOrders = village.troopTrainingOrders.map(o => new TroopTrainingOrder(o, this))
  }

  get hall(): Building | undefined {
    return this.buildings.find(b => b.kind === serverV1Types.Building_Kind.HALL)
  }

  get goldMine(): Building | undefined {
    return this.buildings.find(b => b.kind === serverV1Types.Building_Kind.GOLD_MINE)
  }

  get trainableLeaders(): number {
    const maxLeaders = 1
    let leaders = this.troops.find(t => t.kind == serverV1Types.Troop_Kind.LEADER)?.quantity ?? 0
    this.troopTrainingOrders.forEach(o => {
      if (o.troop.kind === serverV1Types.Troop_Kind.LEADER) leaders++
    })
    return maxLeaders - leaders
  }
  
  canAfford(cost: Resources) {
    if (cost.gold > this.gold) return false
    return true
  }

  addGold(quantity: number) {
    this.gold += quantity
  }

  addBuildingUpgradeOrder(order: BuildingUpgradeOrder) {
    this.buildingUpgradeOrders.push(order)
  }

  removeBuildingUpgradeOrder(id: number) {
    this.buildingUpgradeOrders = this.buildingUpgradeOrders.filter(o => o.id !== id)
  }

  addTroopTrainingOrder(order: TroopTrainingOrder) {
    this.troopTrainingOrders.push(order)
  }

  removeTroopTrainingOrder(id: number) {
    this.troopTrainingOrders = this.troopTrainingOrders.filter(o => o.id !== id)
  }
}