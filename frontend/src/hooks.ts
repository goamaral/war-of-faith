import { useState, useEffect } from 'preact/hooks'

import pubsub, { Event } from './pubsub'
import { Entity } from './entities/entity'

function useRefresh() {
  const [_, setState] = useState({})
  return () => setState({})
}

export function useEntity<T extends  Entity>(entity: T, ...events: Event[]): T {
  const refresh = useRefresh()

  useEffect(() => {
    const unsubscribe = pubsub.subscribe(refresh, entity.getEvent(), ...events)
    return () => {
      unsubscribe()
    };
  }, [])

  return entity
}