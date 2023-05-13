export enum EventType {
  Player = 'player',
  Village = 'village',
  Building = 'building',
}

export class Event {
  type: EventType
  entityId: number

  constructor(type: EventType, entityId: number) {
    this.type = type
    this.entityId = entityId
  }

  toSku(): string {
    return Event.toSku(this.type, this.entityId)
  }

  static toSku(type: EventType, entityId: number) {
    return `${type}-${entityId}`
  }
}

interface Subscriber {
  (event: Event): void
}

type SubscribersMap = {
  [key in EventType]: {
    [event: string]: Subscriber[]
  }
}

class PubSub {
  subscribers: SubscribersMap = {
    [EventType.Player]: {},
    [EventType.Village]: {},
    [EventType.Building]: {},
  }

  subscribe(onMessage: Subscriber, ...events: Event[]) {
    events.forEach(event => {
      if (this.subscribers[event.type][event.toSku()] === undefined) this.subscribers[event.type][event.toSku()] = []
      this.subscribers[event.type][event.toSku()].push(onMessage)
    })
    console.log("MOUNT", events, this.subscribers)

    return () => {
      events.forEach(event => {
        const eventSku = event.toSku()
        this.subscribers[event.type][eventSku] = this.subscribers[event.type][eventSku].filter(s => s === onMessage)
        console.log("UNMOUNT", this.subscribers)
      })
    }
  }

  publish(event: Event) {
    const eventTypeSubscribers = this.subscribers[event.type]
    eventTypeSubscribers[event.toSku()].forEach(onMessage => onMessage(event))
  }
}

const singleton = new PubSub()
export default singleton