import { SlashCommandBuilder } from 'discord.js'
import Command from './BaseCommand'
import i18next from 'i18next'

import type MechaGurun from '../MechaGurun'
import type { Interaction } from 'discord.js'

export default class PingCommand extends Command {
  readonly slash = new SlashCommandBuilder()
    .setName(this.name)
    .setNameLocalizations(i18next.tt('command.ping.name'))
    .setDescription(this.description)
    .setDescriptionLocalizations(i18next.tt('command.ping.description'))

  constructor(gurun: MechaGurun) {
    super(gurun, 'ping', 'Display server latency.')
  }

  async run(interaction: Interaction): Promise<void> {
    if (interaction.isRepliable()) {
      await interaction.reply({
        content: `:ping_pong: ${Math.max(this.gurun.client.ws.ping, 0)}ms`,
      })
    }
  }
}
