import { ActivityType } from 'discord.js'
import type { MechaGurunConfiguration } from '../../types/config'

export const CONFIG_DEFAULTS: MechaGurunConfiguration = {
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
