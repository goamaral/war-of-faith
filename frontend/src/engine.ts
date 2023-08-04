// import { Entity } from "./entities/entity"
// import { GridMap } from "./entities/grid_map"
// import { Player } from "./entities/player"
// import { Village } from "./entities/village"

// class Engine {
//   player: Player
//   clearInterval: number
//   time: number = 0
//   gridMap: GridMap
//   entities: Map<number, Entity> = new Map()

//   constructor() {
//     this.player = new Player()
//     this.gridMap = new GridMap(10, 10)
//     const ok = this.gridMap.addVillage(this.player.id, 3, 3)
//     if (!ok) throw new Error("Failed to add village to map")
//     this.clearInterval = setInterval(this.tick.bind(this), 1000)
//   }

//   tick() {
//     this.time++
//     (this.player as Player).tick()
//   }
// }

// const singleton = new Engine()
// export default singleton

// export function getEntityById<T extends Entity>(id: number): T {
//   // return singleton.entities.get(id) as T
//   return {} as T
// }

// export function getPlayerVillages(playerId: number): Village[] {
//   const villages: Village[] = []
//   singleton.entities.forEach(entity => {
//     if (entity instanceof Village) {
//       const village = entity as Village
//       if (village.playerId === playerId) villages.push(village)
//     }
//   })
//   return villages
// }

// export function getVillageByCoords(coords: string): Village {
//   return singleton.gridMap.cells.get(coords) as Village
// }

// export function getGridMap(): GridMap {
//   return singleton.gridMap
// }

// function randInt() {
//   return Math.floor(Math.random() * 100000000);
// }
// export function newEntity(entity: Entity) {
//   entity.id = randInt()
//   singleton.entities.set(entity.id, entity)
//   return entity.id
// }