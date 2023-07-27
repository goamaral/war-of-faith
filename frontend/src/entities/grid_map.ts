import { EventCategory } from "../pubsub"
import { Entity } from "./entity"
import { Village } from "./village"

export class GridMap extends Entity {
  width: number
  height: number
  cells: Map<string, Village>

  constructor(width: number, height: number) {
    super(EventCategory.GridMap)
    this.width = width
    this.height = height
    this.cells = new Map()
  }

  static generateCoords(x: number, y: number): string {
    return `${x}-${y}`
  }

  addVillage(playerId: number, x: number, y: number): boolean {
    if (!this.cellIsAvailable(x, y)) return false
    const village = new Village(playerId, 3, 3)
    this.cells.set(village.coords, village)
    return true
  }
  
  private cellIsAvailable(x: number, y: number): boolean {
    if (x < 0 || x >= this.width) return false
    if (y < 0 || y >= this.height) return false
    return this.cells.get(GridMap.generateCoords(x, y)) === undefined
  }
}