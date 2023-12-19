import type MechaGurun from '../MechaGurun'

import type { SlashCommandBuilder } from 'discord.js'

export default abstract class Command {
  readonly gurun: MechaGurun
  readonly name: string
  readonly description: string

  abstract slash: SlashCommandBuilder

  constructor(gurun: MechaGurun, name: string, description: string) {
    this.gurun = gurun
    this.name = name
    this.description = description
  }

  abstract run(...args: unknown[]): Promise<void>
}
