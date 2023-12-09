import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building, Troop, Resources, TroopTrainingOrder, BuildingUpgradeOrder, TroopKind } from "."

export enum TroopTrainingStatus {
  TRAINABLE = 0,
  INSUFFICIENT_RESOURCES = 1,
  MAX_LEADERS = 2,
}

interface TroopQuantity {
  [key: string]: number
}

export default class Village {
  id: number
  gold: number

  buildings: Building[]
  buildingUpgradeOrders: BuildingUpgradeOrder[]
  troopQuantity: TroopQuantity
  troopTrainingOrders: TroopTrainingOrder[]

  constructor(village: serverV1Types.Village) {
    this.id = village.id
    this.gold = village.resources?.gold!
    this.buildings = village.buildings.map(b => new Building(b, this))
    this.buildingUpgradeOrders = village.buildingUpgradeOrders.map(o => new BuildingUpgradeOrder(o, this))
    this.troopQuantity = village.troopQuantity
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
    let leaders = this.troopQuantity[TroopKind.LEADER]
    this.troopTrainingOrders.forEach(o => {
      if (o.troopKind === TroopKind.LEADER) leaders++
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

  troopTrainingStatus(troop: Troop, quantity: number): TroopTrainingStatus {
    if (troop.kind == TroopKind.LEADER && this.trainableLeaders == 0) return TroopTrainingStatus.MAX_LEADERS
    if (!this.canAfford(troop.trainCost(quantity))) return TroopTrainingStatus.INSUFFICIENT_RESOURCES
    return TroopTrainingStatus.TRAINABLE
  }

  addTroopTrainingOrder(order: TroopTrainingOrder) {
    this.troopTrainingOrders.push(order)
  }

  removeTroopTrainingOrder(id: number) {
    this.troopTrainingOrders = this.troopTrainingOrders.filter(o => o.id !== id)
  }
}