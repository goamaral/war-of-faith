import * as serverV1Types from "../../lib/protobuf/server/v1/server_pb"
import { Building } from "./building"

export class Village{
  // Buildings
  hall: Building
  goldMine: Building

  // Resources
  gold: number

  constructor(serverVillage: serverV1Types.Village) {
    // Buildings
    this.hall = new Building(serverVillage.buildings?.hall!)
    this.goldMine = new Building(serverVillage.buildings?.goldMine!)

    // Resources
    this.gold = serverVillage.resources?.gold!
  }

  get buildings(): Building[] {
    return [this.hall, this.goldMine]
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