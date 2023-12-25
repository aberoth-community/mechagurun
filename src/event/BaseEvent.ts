import type { ClientEvents } from 'discord.js'
import type MechaGurun from '../MechaGurun'
import type { SchedulerTask } from '../Scheduler'

/**
 * Base event
 * @class
 */
export default abstract class Event {
  readonly gurun: MechaGurun
  readonly name: keyof ClientEvents
  readonly once: boolean

  constructor(gurun: MechaGurun, eventName: keyof ClientEvents, once = false) {
    this.gurun = gurun
    this.name = eventName
    this.once = once
  }

  abstract task?(task: SchedulerTask, ...args: any[]): Promise<void>
  abstract run(...args: any[]): Promise<void>
}
