import pubsub, { EventType } from '../pubsub'
import { Entity } from './entity'
import { Village } from './village'

export enum BuildingType {
  VillageHall = 'village-hall',
  GoldMine = 'gold-mine',
}

const BUILDING_NAME_MAP: { [key in BuildingType]: string} = {
  [BuildingType.VillageHall]: 'Village Hall',
  [BuildingType.GoldMine]: 'Gold Mine'
}

const MAX_LEVEL = 10

export class Building extends Entity {
  level: number
  type: BuildingType
  village: Village

  upgradeTimeLeft: number = 0

  constructor(type: BuildingType, level: number, village: Village) {
    super(EventType.Building)
    this.type = type
    this.level = level
    this.village = village
  }

  get name(): string {
    return BUILDING_NAME_MAP[this.type]
  }

  get upgradeCost(): number {
    return (this.level+1)*5
  }

  upgrade() {
    this.upgradeTimeLeft = (MAX_LEVEL*this.level)
    if (this.type !== BuildingType.VillageHall) {
      this.upgradeTimeLeft = Math.ceil(this.upgradeTimeLeft / this.village.buildings[BuildingType.VillageHall].level)
    }
    pubsub.publish(this.event)
  }

  cancelUpgrade() {
    this.upgradeTimeLeft = 0
    pubsub.publish(this.event)
  }

  tick() {
    switch (this.type) {
      case BuildingType.GoldMine:
        this.village.increaseGold(this.level)
        break
    }

    if (this.upgradeTimeLeft !== 0) {
      this.upgradeTimeLeft--
      if (this.upgradeTimeLeft === 0) {
        this.level++
      }
      pubsub.publish(this.event)
    }
  }
}
