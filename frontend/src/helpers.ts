/* Troops */
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