import { EmbedBuilder, codeBlock, time } from 'discord.js'
import i18next from 'i18next'
import type { Member } from '@prisma/client'
import type { GuildMember } from 'discord.js'

export default async (store: Member, member: GuildMember, lng: string): Promise<EmbedBuilder> => {
  const user = await member.user.fetch()
  return new EmbedBuilder()
    .setColor(member.displayHexColor)
    .setTitle(`${member.nickname ?? member.user.username}`)
    .setDescription(store.bio)
    .setImage(user.bannerURL({ size: 2048 }) ?? null)
    .setThumbnail(member.user.avatarURL() ?? member.user.defaultAvatarURL)
    .setFields([
      {
        name: i18next.t('unit.exp.long', { lng }),
        value: codeBlock(store.experience.toString()),
        inline: true,
      },
      {
        name: i18next.t('unit.level.long', { lng }),
        value: codeBlock('1'),
        inline: true,
      },
      {
        name: i18next.t('embed.profile.joined', { lng }),
        value: `${time(member.joinedAt ?? undefined)}`,
      },
      {
        name: i18next.t('embed.profile.last_active', { lng }),
        value: `${time(store.activeAt)}`,
      },
    ])
}
