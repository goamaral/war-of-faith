import { EventType } from '../pubsub'
import { Entity } from './entity'
import { Village } from './village'

export class Player extends Entity {
  village: Village = new Village()

  constructor() {
    super(EventType.Player)
  }

  tick() {
    this.village.tick()
  }
}