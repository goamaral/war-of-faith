import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building, BuildingUpgradeStatus, Troop, TroopTrainingStatus } from "."

export default class Village extends serverV1Types.Village {
  canAfford(cost: serverV1Types.Resources) {
    if (cost.gold > this.resources!.gold) return false
    return true
  }

  addGold(quantity: number) {
    this.resources!.gold += quantity
  }

  /* BUILDINGS */
  getBuildingUpgradeStatus(building: Building): BuildingUpgradeStatus {
    const nextLevel = this.getBuildingNextLevel(building.kind)
    if (nextLevel > building.maxLevel) return BuildingUpgradeStatus.MAX_LEVEL
    if (!this.canAfford(building.upgradeCost(nextLevel))) return BuildingUpgradeStatus.INSUFFICIENT_RESOURCES
    return BuildingUpgradeStatus.UPGRADABLE
  }

  getBuildingNextLevel(buildingKind: string): number {
    const orders = this.buildingUpgradeOrders.filter(o => o.buildingKind == buildingKind)
    return this.buildingLevel[buildingKind] + orders.length + 1
  }

  addBuildingUpgradeOrder(order: serverV1Types.Building_UpgradeOrder) {
    this.buildingUpgradeOrders.push(order)
  }

  removeBuildingUpgradeOrder(id: number) {
    this.buildingUpgradeOrders = this.buildingUpgradeOrders.filter(o => o.id !== id)
  }

  /* TROOPS */
  getTroopTrainingStatus(troop: Troop, quantity: number, trainableTroops?: number): TroopTrainingStatus {
    if (trainableTroops == 0) return TroopTrainingStatus.MAX_TRAINABLE
    if (!this.canAfford(troop.trainCost(quantity))) return TroopTrainingStatus.INSUFFICIENT_RESOURCES
    return TroopTrainingStatus.TRAINABLE
  }

  addTroopTrainingOrder(order: serverV1Types.Troop_TrainingOrder) {
    this.troopTrainingOrders.push(order)
  }

  removeTroopTrainingOrder(id: number) {
    this.troopTrainingOrders = this.troopTrainingOrders.filter(o => o.id !== id)
  }
}