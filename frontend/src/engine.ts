import { GridMap } from "./entities/grid_map"
import { Player } from "./entities/player"
import { Village } from "./entities/village"

class Engine {
  player: Player
  clearInterval: any
  time: number = 0
  map: GridMap = new GridMap(10, 10)

  constructor() {
    this.player = new Player()
    const village = new Village(this.player, 3, 3)
    const ok = this.map.addVillage(village)
    if (!ok) throw new Error("Failed to add village to map")
    this.player.villages = [village]

    this.clearInterval = setInterval(this.tick.bind(this), 1000)
  }

  tick() {
    this.time++
    this.player.tick()
  }
}

const singleton = new Engine()
export default singleton