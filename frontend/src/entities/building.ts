import pubsub, { EventType } from '../pubsub'
import { Entity } from './entity'

export class Building extends Entity {
  name: string
  level: number

  constructor(name: string, level: number) {
    super(EventType.Building)
    this.name = name
    this.level = level
  }

  levelUp() {
    this.level++
    pubsub.publish(this.event)
  }
}
