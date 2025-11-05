function newLogger(enabled: boolean, category: string) {
  if (!enabled) return () => {}
  return (...args: any[]) => console.debug(`[${category}]`, ...args)
}

const COMBAT_LOGGER_ENABLED = true
export const combatLogger = newLogger(COMBAT_LOGGER_ENABLED, "COMBAT")