import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js'
import Command from './command/BaseCommand'
import Event from './event/BaseEvent'
import Scheduler from './Scheduler'
import { PrismaClient } from '@prisma/client'
import { i18nextInitialize } from './util/i18next'
import importEach from './util/import'
import logger from './util/logger'
import { join } from 'path'
import type { SchedulerTask } from './Scheduler'
import type { ClientEvents } from 'discord.js'
import type { MechaGurunConfiguration } from './types/config'
import type { PackageJson } from 'types-package-json'

/**
 * MechaGurun
 * @class
 */
export default class MechaGurun {
  /** Discord client */
  readonly client: Client
  /** Prisma database connection */
  readonly db = new PrismaClient()
  /** Commands collection */
  readonly commands = new Collection<string, Command>()
  /** Events collection */
  readonly events = new Collection<keyof ClientEvents, Event>()
  readonly scheduler: Scheduler
  /** MechaGurun configuration */
  readonly config: MechaGurunConfiguration
  /** package.json */
  readonly packageJSON: Partial<PackageJson>

  constructor(config: MechaGurunConfiguration, packageJSON: Partial<PackageJson>) {
    this.config = config
    this.packageJSON = packageJSON
    this.client = new Client({
      intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
      ],
      partials: [Partials.Channel, Partials.GuildMember, Partials.Reaction],
      presence: {
        activities: [],
        status: 'dnd',
      },
    })
    this.scheduler = new Scheduler(this)
  }

  /**
   * Handle slash command
   * @param name  Command name
   * @param args  Command arguments
   */
  handleCommand(name: string, args: unknown[]): void {
    const command = this.commands.get(name)
    if (typeof command !== 'undefined') {
      command.run(...args).catch((err) => {
        logger.warn(`failed to handle command '${name}'!`, err)
      })
    } else {
      logger.warn(`unknown command '${name}'!`)
    }
  }

  /**
   * Handle Discord event
   * @param name  Event name
   * @param args  Event arguments
   */
  handleEvent(name: keyof ClientEvents, args: unknown[]): void {
    const event = this.events.get(name)
    if (typeof event !== 'undefined') {
      event.run(...args).catch((err) => {
        logger.error(`Failed to handle event '${name}'!`, err)
      })
    } else {
      logger.warn(`unknown event '${name}'!`)
    }
  }

  /**
   * Handle scheduled event
   * @param task  Scheduler task
   * @param args  Task arguments
   */
  handleTask(task: SchedulerTask, args: unknown[]): void {
    this.events
      .get(task.event)
      ?.task?.(task, ...args)
      .catch((err) => {
        logger.error(`failed to handle scheduler task '${task.name}'!`, err)
      })
  }

  /**
   * Setup & login
   * @param token  Discord bot token
   */
  async start(token?: string): Promise<void> {
    logger.info(`starting mechagurun v${this.packageJSON?.version ?? '???'}...`)

    // initialize i18next
    const languages = await i18nextInitialize(join(__dirname, './locales'), this.config)
    logger.debug(` - loaded ${languages.length} locales(s)...`)
    // load events
    this.events.clear()
    await importEach(join(__dirname, './event'), ({ default: _Event }, path) => {
      if (path.includes('Base') || !(_Event.prototype instanceof Event)) {
        return
      }
      try {
        const event: Event = new _Event(this)
        this.events.set(event.name, event)
        logger.debug(` - loaded event '${event.name}'`, { name: event.name })
        this.client[event.once ? 'once' : 'on'](event.name, (...args: unknown[]) => {
          this.handleEvent(event.name, args)
        })
      } catch (err) {
        logger.error(`failed to load event at '${path}'!`, err)
      }
    })
    logger.debug(` - loaded ${this.events.size} event(s)...`)
    // load commands
    this.commands.clear()
    await importEach(join(__dirname, './command'), ({ default: _Command }, path) => {
      if (path.includes('Base') || !(_Command.prototype instanceof Command)) {
        return
      }
      try {
        const command: Command = new _Command(this)
        this.commands.set(command.name, command)
        logger.debug(` - loaded command '${command.name}'`, { name: command.name })
      } catch (err) {
        logger.error(`failed to load command at '${path}'!`, err)
      }
    })
    logger.debug(` - loaded ${this.commands.size} command(s)...`)
    // restore scheduler
    const tasks = await this.scheduler.restore()
    this.scheduler.on('task_end', (task, ...args) => {
      this.handleTask(task, args)
    })
    logger.debug(` - scheduler restored ${tasks.length} task(s)...`)
    // login
    await this.client.login(token)
  }
}
