import { Player } from "./entities/player"

class Engine {
  player: Player
  clearInterval: any
  time: number = 0

  constructor() {
    this.player = new Player()
    this.clearInterval = setInterval(this.tick.bind(this), 1000)
  }

  tick() {
    this.time++
    this.player.tick()
  }
}

const singleton = new Engine()
export default singleton