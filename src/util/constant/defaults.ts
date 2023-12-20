import { ActivityType } from 'discord.js'
import type { MechaGurunConfiguration } from '../../types/config'

/** Default configuration */
export const DEFAULT_CONFIG: MechaGurunConfiguration = {
  profiles: {
    exp_max: 64,
    exp_min: 8,
    level_max: 999,
  },
  presence: {
    activities: [
      {
        name: 'Aberoth',
        type: ActivityType.Watching,
        url: 'https://www.twitch.tv/directory/category/aberoth/*',
      },
    ],
    status: 'online',
  },
  localization: {
    default_language: 'en-US',
  },
}
