import type { ClientEvents } from 'discord.js'
import type MechaGurun from '../MechaGurun'

export default abstract class Event {
  readonly gurun: MechaGurun
  readonly name: keyof ClientEvents
  readonly once: boolean

  constructor(gurun: MechaGurun, eventName: keyof ClientEvents, once = false) {
    this.gurun = gurun
    this.name = eventName
    this.once = once
  }

  abstract run(...args: any[]): Promise<void>
}
