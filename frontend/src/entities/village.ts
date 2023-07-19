import pubsub, { EventCategory, EventAction } from '../pubsub'
import { Building, BuildingType } from './building'
import { Entity } from './entity'

export type BuildingMap = {
  [index in BuildingType]: Building
}

export interface TroopMap {
  [key: string]: number

  leaders: number
}

export interface ResourceMap {
  [key: string]: number

  gold: number
}

export class Village extends Entity {
  hasLeader: boolean = false
  buildings: BuildingMap = {
    [BuildingType.VillageHall]: new Building(BuildingType.VillageHall, 1, this),
    [BuildingType.GoldMine]: new Building(BuildingType.GoldMine, 1, this),
  }
  troops: TroopMap = {
    leaders: 0
  }
  resources: ResourceMap = {
    gold: 0,
  }

  constructor() {
    super(EventCategory.Village)
  }

  tick() {
    this.buildings[BuildingType.VillageHall].tick()
    this.buildings[BuildingType.GoldMine].tick()
  }

  increaseGold(amount: number) {
    this.resources.gold += amount
    pubsub.publish(this.getEvent(EventAction.GoldUpdated))
  }

  upgradeBuilding(buildingType: BuildingType) {
    const building = this.buildings[buildingType]

    if (this.resources.gold < building.upgradeCost) return

    this.resources.gold -= building.upgradeCost
    building.upgrade()
  }

  cancelBuildingUpgrade(buildingType: BuildingType) {
    const building = this.buildings[buildingType]
  
    if (building.upgradeTimeLeft === 0) return

    this.resources.gold += building.upgradeCost
    building.cancelUpgrade()
  }
}
