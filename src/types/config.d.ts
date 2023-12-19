import type { ClientOptions } from 'discord.js'

export type MechaGurunConfiguration = Partial<{
  presence: ClientOptions['presence']
  localization: {
    default_language: string
  }
}>
