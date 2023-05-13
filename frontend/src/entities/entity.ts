import { EventType, Event } from '../pubsub'
let nextId = 1

export class Entity {
  id: number
  event: Event

  constructor(eventType: EventType) {
    this.id = nextId++
    this.event = new Event(eventType, this.id)
  }
}