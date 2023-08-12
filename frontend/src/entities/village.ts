import { makeAutoObservable } from "mobx"

import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building } from "./building"

export class Village{
  id: number

  gold: number

  buildings: Map<serverV1Types.Building_Kind, Building>

  constructor(village: serverV1Types.Village) {
    makeAutoObservable(this)
    this.id = village.id
    this.gold = village.resources?.gold!
    this.buildings = new Map<serverV1Types.Building_Kind, Building>(village.buildings.map(b => [b.kind, new Building(b)]))
  }

  get hall(): Building | undefined {
    return this.buildings.get(serverV1Types.Building_Kind.HALL)
  }

  get goldMine(): Building | undefined {
    return this.buildings.get(serverV1Types.Building_Kind.GOLD_MINE)
  }

  updateBuilding(building: Building) {
    this.buildings.set(building.kind, building)
  }
}

// import { getEntityById } from '../engine'
// import pubsub, { EventCategory, EventAction } from '../pubsub'
// import { GoldMine, VillageHall } from './building'
// import { Entity } from './entity'
// import { GridMap } from './grid_map'
// import { Player } from './player'

// export interface BuildingMap {
//   villageHall: VillageHall
//   goldMine: GoldMine
// }

// export interface TroopMap {
// }

// export interface ResourceMap {
//   gold: number
// }

// export class Village extends Entity {
//   playerId: number
//   x: number
//   y: number
//   buildings: BuildingMap = {
//     villageHall: new VillageHall(this.id),
//     goldMine: new GoldMine(this.id),
//   }
//   resources: ResourceMap = {
//     gold: 0,
//   }

//   constructor(playerId: number, x: number, y: number) {
//     super(EventCategory.Village)
//     this.playerId = playerId
//     this.x = x
//     this.y = y
//   }

//   get coords(): string {
//     return GridMap.generateCoords(this.x, this.y)
//   }

//   get player(): Player {
//     return getEntityById<Player>(this.playerId)
//   }

//   tick() {
//     this.buildings.villageHall.tick()
//     this.buildings.goldMine.tick()
//   }

//   increaseGold(amount: number) {
//     this.resources.gold += amount
//     pubsub.publish(this.getEvent(EventAction.GoldUpdated))
//   }

//   decreaseGold(amount: number): boolean {
//     if (this.resources.gold < amount) return false

//     this.resources.gold -= amount
//     pubsub.publish(this.getEvent(EventAction.GoldUpdated))
//     return true
//   }
// }