import type { ClientOptions } from 'discord.js'

/** MechaGurun config */
export type MechaGurunConfiguration = Partial<{
  /** Discord presence */
  presence: ClientOptions['presence']
  /** Localization options */
  localization: {
    /** Fallback language */
    default_language: string
  }
}>
