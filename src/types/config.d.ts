import type { ClientOptions } from 'discord.js'

/** MechaGurun config */
export type MechaGurunConfiguration = Partial<{
  /** Discord presence */
  presence: ClientOptions['presence']
  /** Localization options */
  localization: Partial<{
    /** Fallback language */
    default_language: string
  }>
  profiles: Partial<{
    exp_min: number
    exp_max: number
    exp_timeout_min: number
    exp_timeout_max: number
    level_max: number
  }>
}>
