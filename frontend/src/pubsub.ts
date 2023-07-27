export enum EventCategory {
  GridMap = 'grid-map',
  Player = 'player',
  Village = 'village',
  Building = 'building',
}

export enum EventAction {
  UpgradeStarted = 'upgrade-started',
  UpgradeCanceled = 'upgrade-canceled',
  UpgradeTicked = 'upgrade-ticked',
  GoldUpdated = 'gold-updated',
  LeaderTrainStarted = 'leader-train-started',
  LeaderTrainCanceled = 'leader-train-canceled',
  LeaderTrainTicked = 'leader-train-ticked',
}

export class Event {
  category: EventCategory
  entityId: number | undefined
  action: EventAction | undefined

  constructor(category: EventCategory, entityId?: number, action?: EventAction) {
    this.category = category
    this.entityId = entityId
    this.action = action
  }

  toSku(): string {
    return Event.toSku(this.category, this.entityId, this.action)
  }

  static toSku(category: EventCategory, entityId?: number, action?: EventAction): string {
    let sku = `${category}`
    if (entityId === undefined) return sku
    sku = `${sku}:${entityId}`
    if (action === undefined) return sku
    return `${sku}:${action}`
  }
}

interface Subscriber{
  (event: Event): void
}

class PubSub {
  subscribers: Map<string, Subscriber[]> = new Map<string, Subscriber[]>()

  subscribe(onMessage: Subscriber, ...events: Event[]) {
    events.forEach(event => {
      const eventSku = event.toSku()
      const subscribers = this.subscribers.get(eventSku) || []
      subscribers.push(onMessage)
      this.subscribers.set(eventSku, subscribers)
    })

    return () => {
      events.forEach(event => {
        const eventSku = event.toSku()
        const subscribers = (this.subscribers.get(eventSku) || []).filter(s => s === onMessage)
        this.subscribers.set(eventSku, subscribers)
      })
    }
  }

  publish(event: Event) {
    const subscribers = (this.subscribers.get(Event.toSku(event.category)) || [])
    if (event.entityId) subscribers.push(...(this.subscribers.get(Event.toSku(event.category, event.entityId)) || []))
    if (event.action) subscribers.push(...(this.subscribers.get(Event.toSku(event.category, event.entityId, event.action)) || []))


    subscribers.forEach(onMessage => onMessage(event))
  }
}

const singleton = new PubSub()
export default singleton