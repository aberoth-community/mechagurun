import Command from './BaseCommand'
import ProfileEmbed from '../embed/ProfileEmbed'
import i18next from 'i18next'
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js'
import type MechaGurun from '../MechaGurun'

export default class ProfileCommand extends Command {
  constructor(gurun: MechaGurun) {
    super(gurun, 'profile')
    this.slash
      .setName(this.name)
      .setNameLocalizations(i18next.tt('command.profile.name'))
      .setDescription(this.description)
      .setDescriptionLocalizations(i18next.tt('command.profile.description'))
      .addUserOption((opt) => {
        return opt
          .setName('user')
          .setNameLocalizations(i18next.tt('command.profile.option.user.name'))
          .setDescription(i18next.t('command.profile.option.user.description'))
          .setDescriptionLocalizations(i18next.tt('command.profile.option.user.description'))
      })
      .addStringOption((opt) => {
        return opt
          .setName('bio')
          .setNameLocalizations(i18next.tt('command.profile.option.bio.name'))
          .setDescription(i18next.t('command.profile.option.bio.description'))
          .setDescriptionLocalizations(i18next.tt('command.profile.option.bio.description'))
      })
  }

  async run(interaction: ChatInputCommandInteraction): Promise<void> {
    const bio = interaction.options.getString('bio')
    const user = interaction.options.getUser('user') ?? interaction.user
    let store = await this.gurun.db.member.findUnique({ where: { memberId: user.id } })
    // doesn't have a profile
    if (store === null || user.bot) {
      await interaction.reply({
        content: i18next.t('command.profile.error.no_profile', {
          user: user.toString(),
          lng: interaction.locale,
        }),
        ephemeral: true,
      })
      return
    }
    // set bio
    if (bio !== null && user.equals(interaction.user)) {
      store = await this.gurun.db.member.update({
        data: {
          bio,
        },
        where: { memberId: interaction.user.id },
      })
    }
    // display stored member
    await interaction.reply({
      content: `${user.toString()}`,
      embeds: [await ProfileEmbed(store, interaction.member as GuildMember, interaction.locale)],
      ephemeral: false,
    })
  }
}
