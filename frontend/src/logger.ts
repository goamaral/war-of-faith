function newLogger(enabled: boolean, category: string) {
  if (!enabled) return () => {}
  return (...args: any[]) => console.debug(`[${category}]`, ...args)
}

const COMBAT_LOGGER_ENABLED = true
export const combatLogger = newLogger(COMBAT_LOGGER_ENABLED, "COMBAT")

const MOVEMENT_LOGGER_ENABLED = true
export const movementLogger = newLogger(MOVEMENT_LOGGER_ENABLED, "MOVEMENT")

const ENDING_LOGGER_ENABLED = true
export const endingLogger = newLogger(ENDING_LOGGER_ENABLED, "ENDING")