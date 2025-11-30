import * as serverV1 from '../../lib/protobuf/server/v1/server_pb'

export function playerFields(world: serverV1.World, playerId: string, filter?: (f: serverV1.World_Field) => boolean) {
  return Object.values(world.fields).filter(f => f.playerId == playerId && (!filter || filter(f)))
}
export function playerVillageFields( world: serverV1.World, playerId: string, filter?: (f: serverV1.World_Field) => boolean) {
  return playerFields(world, playerId, filter).filter(f => f.kind == serverV1.World_Field_Kind.VILLAGE)
}

export function fieldCanAfford(field: serverV1.World_Field, cost: serverV1.Resources) {
  return cost.gold <= field.resources!.gold
}

export function countTroops(troops: Record<string, number>) {
  return Object.values(troops).reduce((a, b) => a + b, 0)
}

/* Coords */
export function decodeCoords(coords: string) {
  const [x, y] = coords.split('_').map(Number)
  return { x, y }
}
export function encodeCoords(x: number, y: number) {
  return `${x}_${y}`
}
export function calcDist(sourceCoords: string, targetCoords: string) {
  const { x: srcX, y: srcY } = decodeCoords(sourceCoords)
  const { x: trgX, y: trgY } = decodeCoords(targetCoords)
  return Math.abs(srcX - trgX) + Math.abs(srcY - trgY)
}

/* Record math */
export function add<T extends Record<string, any>>(a: T, b: T): T {
  const res = { ...a } as Record<string, any>
  for (const [k, v] of Object.entries(b)) {
    res[k] = typeof v == "number" ? res[k] + v : v
  }
  return res as T
}
export function sub<T extends Record<string, any>>(a: T, b: T): T {
  const res = { ...a } as Record<string, any>
  for (const [k, v] of Object.entries(b)) {
    res[k] = typeof v == "number" ? res[k] - v : v
  }
  return res as T
}
export function mulN<T extends Record<string, any>>(a: T, n: number): T {
  const res = {} as Record<string, any>
  for (const [k, v] of Object.entries(a)) {
    res[k] = typeof v == "number" ? v * n : v
  }
  return res as T
}
export function div<T extends Record<string, any>>(a: T, b: T, filter?: (k: string) => boolean): number {
  let res = Infinity
  for (const [k, v] of Object.entries(a)) {
    if (typeof v != "number") continue
    if (filter && !filter(k)) continue
    res = Math.min(res, v / b[k])
  }
  return res
}
export function divN<T extends Record<string, any>>(a: T, n: number): T {
  const res = {} as Record<string, any>
  for (const [k, v] of Object.entries(a)) {
    res[k] = typeof v == "number" ? v / n : v
  }
  return res as T
}