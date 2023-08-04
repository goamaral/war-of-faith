// import { getPlayerVillages } from '../engine'
// import { EventCategory } from '../pubsub'
// import { Entity } from './entity'
// import { Village } from './village'

// export class Player extends Entity {
//   constructor() {
//     super(EventCategory.Player)
//   }

//   get canTrainLeader(): boolean {
//     return this.totalLeaders < this.maxTotalLeaders
//   }

//   get totalLeaders(): number {
//     return this.villages.reduce((acc, village) => acc + village.buildings.villageHall.leaders, 0)
//   }

//   get maxTotalLeaders(): number {
//     return this.villages.length
//   }

//   get villages(): Village[] {
//     return getPlayerVillages(this.id)
//   }

//   tick() {
//     for (const village of this.villages) village.tick()
//   }
// }