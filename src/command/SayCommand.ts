import Command from './BaseCommand'
import i18next from 'i18next'
import type { ChatInputCommandInteraction } from 'discord.js'
import type MechaGurun from '../MechaGurun'

// TODO: embed builder sub-commands

export default class SayCommand extends Command {
  constructor(gurun: MechaGurun) {
    super(gurun, 'say')
    this.slash
      .setName(this.name)
      .setNameLocalizations(i18next.tt('command.say.name'))
      .setDescription(this.description)
      .setDescriptionLocalizations(i18next.tt('command.say.description'))
      .addStringOption((opt) => {
        return opt
          .setRequired(true)
          .setName('content')
          .setNameLocalizations(i18next.tt('command.say.option.content.name'))
          .setDescription(i18next.t('command.say.option.content.description'))
          .setDescriptionLocalizations(i18next.tt('command.say.option.content.description'))
      })
      .addStringOption((opt) => {
        return opt
          .setName('embeds')
          .setNameLocalizations(i18next.tt('command.say.option.embeds.name'))
          .setDescription(i18next.t('command.say.option.embeds.description'))
          .setDescriptionLocalizations(i18next.tt('command.say.option.embeds.description'))
      })
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const content = interaction.options.getString('content', true)
    const embeds = interaction.options.getString('embeds')
    await interaction.reply({
      content,
      ephemeral: false,
      embeds: embeds !== null ? JSON.parse(embeds) : [],
    })
  }
}
