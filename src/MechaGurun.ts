import { Client, Collection, GatewayIntentBits } from 'discord.js'
import Event from './event/BaseEvent'
import Command from './command/BaseCommand'
import importEach from '$util/import'
import logger from '$util/logger'
import { join } from 'path'

import type { MechaGurunConfiguration } from '$types/config'

export default class MechaGurun {
  private readonly _commands = new Collection<string, Command>()
  private readonly _events = new Collection<string, Event>()
  readonly client: Client
  readonly config: MechaGurunConfiguration

  constructor(config: MechaGurunConfiguration) {
    this.config = config
    this.client = new Client({
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
      ],
      presence: {
        activities: [],
        status: 'dnd',
      },
    })
  }

  handleCommand(name: string, ...args: unknown[]): void {
    const command = this._commands.get(name)
    if (typeof command !== 'undefined') {
      command.run(...args).catch((err) => {
        logger.warn(`failed to handle command '${name}'!`, err)
      })
    } else {
      logger.warn(`unknown command '${name}'!`)
    }
  }

  handleEvent(name: string, ...args: unknown[]): void {
    const event = this._events.get(name)
    if (typeof event !== 'undefined') {
      event.run(...args).catch((err) => {
        logger.error(`Failed to handle event '${name}'!`, err)
      })
    } else {
      logger.warn(`unknown event '${name}'!`)
    }
  }

  async start(token?: string): Promise<void> {
    // load events
    this._events.clear()
    await importEach(join(__dirname, './event'), ({ default: _Event }, path) => {
      if (path.includes('Base') || !(_Event.prototype instanceof Event)) {
        return
      }
      try {
        const event: Event = new _Event(this)
        this._events.set(event.name, event)
        logger.debug(`loaded event '${event.name}'`, { name: event.name })
        this.client[event.once ? 'once' : 'on'](event.name, (...args: unknown[]) => {
          this.handleEvent(event.name, ...args)
        })
      } catch (err) {
        logger.error(`failed to load event at '${path}'!`, err)
      }
    })
    // load commands
    this._commands.clear()
    await importEach(join(__dirname, './command'), ({ default: _Command }, path) => {
      if (path.includes('Base') || !(_Command.prototype instanceof Command)) {
        return
      }
      try {
        const command: Command = new _Command(this)
        this._commands.set(command.name, command)
        logger.debug(`loaded command '${command.name}'`, { name: command.name })
      } catch (err) {
        logger.error(`failed to load command at '${path}'!`, err)
      }
    })
    // login
    await this.client.login(token)
  }
}
