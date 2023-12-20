import { SlashCommandBuilder } from 'discord.js'
import i18next from 'i18next'
import type MechaGurun from '../MechaGurun'

export default abstract class Command {
  readonly gurun: MechaGurun
  readonly slash: SlashCommandBuilder
  readonly name: string
  readonly description: string

  constructor(gurun: MechaGurun, commandName: string) {
    this.gurun = gurun
    this.name = commandName
    this.description = i18next.t(`command.${this.name}.description`)
    this.slash = new SlashCommandBuilder()
  }

  abstract run(...args: unknown[]): Promise<void>
}
