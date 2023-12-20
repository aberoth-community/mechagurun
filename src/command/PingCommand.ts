import Command from './BaseCommand'
import type MechaGurun from '../MechaGurun'
import type { ChatInputCommandInteraction } from 'discord.js'
import i18next from 'i18next'

export default class PingCommand extends Command {
  constructor(gurun: MechaGurun) {
    super(gurun, 'ping')
    this.slash
      .setName(this.name)
      .setNameLocalizations(i18next.tt('command.ping.name'))
      .setDescription(this.description)
      .setDescriptionLocalizations(i18next.tt('command.ping.description'))
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply({
      content: i18next.t('command.ping.response', {
        ping: Math.max(this.gurun.client.ws.ping, 0),
        lng: interaction.locale,
      }),
      ephemeral: false,
    })
  }
}
