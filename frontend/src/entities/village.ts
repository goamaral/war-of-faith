import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building, Troop, Resources, TroopTrainingOrder, BuildingUpgradeOrder } from "."

export enum TroopTrainingStatus {
  TRAINABLE = 0,
  INSUFFICIENT_RESOURCES = 1,
  MAX_TRAINABLE = 2,
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

  troopTrainingStatus(troop: Troop, quantity: number, trainableTroops?: number): TroopTrainingStatus {
    if (trainableTroops == 0) return TroopTrainingStatus.MAX_TRAINABLE
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