import { SlashCommandBuilder } from 'discord.js'
import i18next from 'i18next'
import type MechaGurun from '../MechaGurun'

/**
 * Base command
 * @class
 */
export default abstract class Command {
  /** MechaGurun */
  readonly gurun: MechaGurun
  /** Slash command */
  readonly slash: SlashCommandBuilder
  /** Command name */
  readonly name: string
  /** Command description */
  readonly description: string

  constructor(gurun: MechaGurun, commandName: string) {
    this.gurun = gurun
    this.name = commandName
    this.description = i18next.t(`command.${this.name}.description`)
    this.slash = new SlashCommandBuilder()
  }

  abstract run(...args: unknown[]): Promise<void>
}
