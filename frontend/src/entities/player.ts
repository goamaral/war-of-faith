import { EventCategory } from '../pubsub'
import { Entity } from './entity'
import { Village } from './village'

export class Player extends Entity {
  village: Village = new Village()

  constructor() {
    super(EventCategory.Player)
  }

  tick() {
    this.village.tick()
  }
}