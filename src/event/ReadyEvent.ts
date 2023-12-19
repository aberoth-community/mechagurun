import { REST, Routes } from 'discord.js'
import Event from './BaseEvent'
import assert from '../util/assert'
import logger from '../util/logger'

import type MechaGurun from '../MechaGurun'

export default class ReadyEvent extends Event {
  readonly appId: string
  readonly guildId?: string
  readonly rest: REST

  constructor(gurun: MechaGurun) {
    super(gurun, 'ready', true)
    this.appId = assert(
      process.env.DISCORD_APP_ID,
      `environment variable 'DISCORD_APP_ID' is required!`,
    )
    this.guildId = process.env.DISCORD_GUILD_ID
    this.rest = new REST().setToken(
      assert(
        process.env.DISCORD_BOT_TOKEN,
        `environment variable 'DISCORD_BOT_TOKEN' is required!`,
      ),
    )
  }

  async clear(): Promise<void> {
    await this.rest.put(
      typeof this.guildId === 'string'
        ? Routes.applicationGuildCommands(this.appId, this.guildId)
        : Routes.applicationCommands(this.appId),
      { body: [] },
    )
    logger.debug('cleared slash commands')
  }

  async register(): Promise<void> {
    const res = (await this.rest.put(
      typeof this.guildId === 'string'
        ? Routes.applicationGuildCommands(this.appId, this.guildId)
        : Routes.applicationCommands(this.appId),
      // eslint-disable-next-line @typescript-eslint/dot-notation
      { body: this.gurun['_commands'].map((command) => command.slash.toJSON()) },
    )) as unknown[]
    logger.debug(`registered ${res.length} command(s)...`, {
      appId: this.appId,
      guildId: this.guildId,
    })
  }

  async run(): Promise<void> {
    const user = this.gurun.client.user!
    if (typeof this.gurun.config.presence !== 'undefined') {
      user.setPresence(this.gurun.config.presence)
    }
    await this.register()
    logger.info(`logged into discord as '${user.username}#${user.id}'!`)
  }
}
