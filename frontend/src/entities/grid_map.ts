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

  static generateCoord(x: number, y: number): string {
    return `${x},${y}`
  }

  addVillage(village: Village): boolean {
    if (!this.cellIsAvailable(village.x, village.y)) return false
    this.cells.set(GridMap.generateCoord(village.x, village.y), village)
    return true
  }
  
  private cellIsAvailable(x: number, y: number): boolean {
    if (x < 0 || x >= this.width) return false
    if (y < 0 || y >= this.height) return false
    return this.cells.get(GridMap.generateCoord(x, y)) === undefined
  }
}