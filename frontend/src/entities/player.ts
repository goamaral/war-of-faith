import { EventCategory } from '../pubsub'
import { Entity } from './entity'
import { Village } from './village'

export class Player extends Entity {
  villages: Village[] = []

  constructor() {
    super(EventCategory.Player)
  }

  tick() {
    for (const village of this.villages) village.tick()
  }

  get canTrainLeader(): boolean {
    return this.totalLeaders < this.maxTotalLeaders
  }

  get totalLeaders(): number {
    return this.villages.reduce((acc, village) => acc + village.buildings.villageHall.leaders, 0)
  }

  get maxTotalLeaders(): number {
    return this.villages.length
  }
}