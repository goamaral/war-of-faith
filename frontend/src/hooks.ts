import { useState, useEffect } from 'preact/hooks'

import pubsub, { Event } from './pubsub'
import { Entity } from './entities/entity'
import { Player } from './entities/player'
import { Village } from './entities/village'
import { Building, BuildingType } from './entities/building'

function useRefresh() {
  const [_, setState] = useState({})
  return () => setState({})
}

function useEntity(entity: Entity, ...events: Event[]): Entity {
  const refresh = useRefresh()

  useEffect(() => {
    const unsubscribe = pubsub.subscribe(refresh, entity.event, ...events)
    return () => {
      unsubscribe()
    };
  }, [])

  return entity
}

export function usePlayer(player: Player): Player {
  return useEntity(player) as Player
}

export function useVillage(village: Village): Village {
  return useEntity(
    village,
    village.buildings[BuildingType.VillageHall].event,
    village.buildings[BuildingType.GoldMine].event,
  ) as Village
}

export function useBuilding(building: Building): Building {
  return useEntity(building) as Building
}