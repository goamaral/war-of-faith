import { Event, EventCategory, EventAction } from "../pubsub"
import { newEntity } from '../engine'


export class Entity {
  id: number
  eventCategory: EventCategory

  constructor(eventCategory: EventCategory) {
    this.eventCategory = eventCategory
    this.id = newEntity(this)
  }

  getEvent(action?: EventAction): Event {
    return new Event(this.eventCategory, this.id, action)
  }
}