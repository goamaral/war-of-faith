import pubsub, { EventCategory, EventAction } from '../pubsub'
import { GoldMine, VillageHall } from './building'
import { Entity } from './entity'
import { Player } from './player'

export interface BuildingMap {
  villageHall: VillageHall
  goldMine: GoldMine
}

export interface TroopMap {
}

export interface ResourceMap {
  gold: number
}

export class Village extends Entity {
  player: Player
  buildings: BuildingMap = {
    villageHall: new VillageHall(this),
    goldMine: new GoldMine(this),
  }
  resources: ResourceMap = {
    gold: 0,
  }

  constructor(player: Player) {
    super(EventCategory.Village)
    this.player = player
  }

  tick() {
    this.buildings.villageHall.tick()
    this.buildings.goldMine.tick()
  }

  increaseGold(amount: number) {
    this.resources.gold += amount
    pubsub.publish(this.getEvent(EventAction.GoldUpdated))
  }

  decreaseGold(amount: number): boolean {
    if (this.resources.gold < amount) return false

    this.resources.gold -= amount
    pubsub.publish(this.getEvent(EventAction.GoldUpdated))
    return true
  }
}