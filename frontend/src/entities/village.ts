import pubsub, { EventType } from '../pubsub'
import { Building } from './building'
import { Entity } from './entity'

export interface BuildingMap {
  [index: string]: Building

  villageHall: Building,
  goldMine: Building
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
    villageHall: new Building('Village Hall', 1),
    goldMine: new Building('Gold Mine', 1),
  }
  troops: TroopMap = {
    leaders: 0
  }
  resources: ResourceMap = {
    gold: 0,
  }

  constructor() {
    super(EventType.Village)
  }

  tick() {
    this.resources.gold++
    pubsub.publish(this.event)
  }
}
