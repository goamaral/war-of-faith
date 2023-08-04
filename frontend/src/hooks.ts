// import { useState, useEffect } from 'preact/hooks'

// import pubsub, { Event } from './pubsub'
// import { Entity } from './entities/entity'
// import { getEntityById } from './engine'

// export function useEntity<T extends  Entity>(entity: T, ...events: Event[]): T {
//   const [state, setState] = useState(entity)

//   useEffect(() => {
//     const unsubscribe = pubsub.subscribe(
//       () => setState(getEntityById<T>(entity.id)),
//       entity.getEvent(),
//       ...events,
//     )
//     return () => unsubscribe()
//   }, [])

//   return state
// }