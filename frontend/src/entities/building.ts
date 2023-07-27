import pubsub, { EventCategory, EventAction } from '../pubsub'
import { getEntityById } from '../engine'
import { Entity } from './entity'
import { Village } from './village'

export enum BuildingType {
  VillageHall = 'village-hall',
  GoldMine = 'gold-mine',
}

const NAME_MAP: { [key in BuildingType]: string} = {
  [BuildingType.VillageHall]: 'Village Hall',
  [BuildingType.GoldMine]: 'Gold Mine'
}

interface Cost { gold: number, time: number }

const BUILDING_UPGRADE_COSTS: { [key in BuildingType]: Cost[] } = {
  [BuildingType.VillageHall]: [
    { gold: 10, time: 10 },
    { gold: 10, time: 10 },
  ],
  [BuildingType.GoldMine]: [
    { gold: 0, time: 1 },
    { gold: 10, time: 10 },
  ],
}

export class Building extends Entity {
  level: number = 0
  type: BuildingType
  villageId: number

  upgradeTimeLeft: number = 0

  constructor(type: BuildingType, villageId: number) {
    super(EventCategory.Building)
    this.type = type
    this.villageId = villageId
  }

  get name(): string {
    return NAME_MAP[this.type]
  }

  get upgradeCost(): Cost {
    return BUILDING_UPGRADE_COSTS[this.type][this.level]
  }

  get isUpgradable(): boolean {
    return this.level < BUILDING_UPGRADE_COSTS[this.type].length
  }

  get village(): Village {
    return getEntityById<Village>(this.villageId)
  }

  upgrade(): boolean {
    if (!this.isUpgradable) return false
    if (this.upgradeTimeLeft !== 0) return false

    const ok = this.village.decreaseGold(this.upgradeCost.gold)
    if (!ok) return false

    this.upgradeTimeLeft = this.upgradeCost.time
    if (this.type !== BuildingType.VillageHall) {
      this.upgradeTimeLeft = this.village.buildings.villageHall.applyUpgradeBonus(this.upgradeTimeLeft)
    }
    pubsub.publish(this.getEvent(EventAction.UpgradeStarted))
    return true
  }

  cancelUpgrade() {
    if (this.upgradeTimeLeft === 0) return
  
    this.village.increaseGold(this.upgradeCost.gold)
    this.upgradeTimeLeft = 0
    pubsub.publish(this.getEvent(EventAction.UpgradeCanceled))
  }

  tick() {
    if (this.upgradeTimeLeft !== 0) {
      this.upgradeTimeLeft--
      if (this.upgradeTimeLeft === 0) this.level++
      pubsub.publish(this.getEvent(EventAction.UpgradeTicked))
    }
  }
}


const VILLAGE_HALL_UPGRADE_BONUS = [0, 0.1, 0.2, 0.3, 0.4, 0.5]
export class VillageHall extends Building {
  leaders: number = 0
  leaderTrainTimeLeft: number = 0

  constructor(villageId: number) {
    super(BuildingType.VillageHall, villageId)
  }

  get leaderTrainCost(): Cost {
    return { gold: 10, time: 10 }
  }

  get canTrainLeader(): boolean {
    return this.level > 0 && this.village.player.canTrainLeader
  }

  applyUpgradeBonus(time: number): number {
    return time * (1 - VILLAGE_HALL_UPGRADE_BONUS[this.level])
  }

  trainLeader(): boolean {
    if (!this.village.player.canTrainLeader) return false
    if (this.leaderTrainTimeLeft !== 0) return false

    const ok = this.village.decreaseGold(this.leaderTrainCost.gold)
    if (!ok) return false

    this.leaderTrainTimeLeft = this.applyUpgradeBonus(this.upgradeCost.time)
    pubsub.publish(this.getEvent(EventAction.LeaderTrainStarted))
    return true
  }

  cancelTrainLeader() {
    if (this.leaderTrainTimeLeft === 0) return

    this.village.increaseGold(this.leaderTrainCost.gold)
    this.leaderTrainTimeLeft = 0
    pubsub.publish(this.getEvent(EventAction.LeaderTrainCanceled))
  }

  tick(): void {
    if (this.leaderTrainTimeLeft !== 0) {
      this.leaderTrainTimeLeft--
      if (this.leaderTrainTimeLeft === 0) this.leaders++
      pubsub.publish(this.getEvent(EventAction.LeaderTrainTicked))
    }

    super.tick()
  }
}

export class GoldMine extends Building {
  constructor(villageId: number) {
    super(BuildingType.GoldMine, villageId)
  }

  tick(): void {
    this.village.increaseGold(this.level)
    super.tick()
  }
}