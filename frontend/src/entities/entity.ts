import { Event, EventCategory, EventAction } from "../pubsub"

let nextId = 1

export class Entity {
  id: number
  eventCategory: EventCategory

  constructor(eventCategory: EventCategory) {
    this.id = nextId++
    this.eventCategory = eventCategory
  }

  getEvent(action?: EventAction): Event {
    return new Event(this.eventCategory, this.id, action)
  }
}