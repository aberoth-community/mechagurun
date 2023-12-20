import { REST, Routes } from 'discord.js'
import Event from './BaseEvent'
import assert from '../util/assert'
import logger from '../util/logger'

import type MechaGurun from '../MechaGurun'

/**
 * Ready event
 * @class
 */
export default class ReadyEvent extends Event {
  /** Discord app id */
  readonly appId: string
  /** Discord guild id */
  readonly guildId?: string
  readonly isLocal: boolean
  /** Discord rest client */
  readonly rest: REST

  constructor(gurun: MechaGurun) {
    super(gurun, 'ready', true)
    this.appId = assert(
      process.env.DISCORD_APP_ID,
      `environment variable 'DISCORD_APP_ID' is required!`,
    )
    this.guildId = process.env.DISCORD_GUILD_ID
    this.isLocal = typeof this.guildId !== 'undefined'
    this.rest = new REST().setToken(
      assert(
        process.env.DISCORD_BOT_TOKEN,
        `environment variable 'DISCORD_BOT_TOKEN' is required!`,
      ),
    )
  }

  /** Clear slash commands */
  async clear(): Promise<void> {
    await this.rest.put(
      typeof this.guildId === 'string'
        ? Routes.applicationGuildCommands(this.appId, this.guildId)
        : Routes.applicationCommands(this.appId),
      { body: [] },
    )
    logger.debug('cleared slash commands')
  }

  /** register chat commands */
  async register(): Promise<void> {
    try {
      const res = (await this.rest.put(
        this.isLocal
          ? Routes.applicationGuildCommands(this.appId, this.guildId!)
          : Routes.applicationCommands(this.appId),
        { body: this.gurun.commands.map((command) => command.slash.toJSON()) },
      )) as unknown[]
      logger.debug(`registered ${res.length} command(s)...`)
    } catch (error) {
      logger.error('failed to register commands!', { error })
    }
  }

  /** Update guild values */
  async updateGuilds(): Promise<void> {
    const guilds = await this.gurun.client.guilds.fetch()
    logger.debug(`updating ${guilds.size} guild(s)...`)
    for (const guild of guilds.values()) {
      await this.gurun.db.guild.upsert({
        create: {
          name: guild.name,
          guildId: guild.id,
        },
        update: {
          name: guild.name,
        },
        where: { guildId: guild.id },
      })
    }
  }

  async run(): Promise<void> {
    const user = this.gurun.client.user!
    if (typeof this.gurun.config.presence !== 'undefined') {
      user.setPresence(this.gurun.config.presence)
    }
    await this.register()
    await this.updateGuilds()
    logger.info(`logged into discord as '${user.username}#${user.id}'!`)
  }
}
