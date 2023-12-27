import { DEFAULT_CONFIG } from '../util/constant'
import BaseEvent from './BaseEvent'
import i18next from 'i18next'
import logger from '../util/logger'
import type { Message, User } from 'discord.js'
import type MechaGurun from '../MechaGurun'
import type { SchedulerTask } from '../Scheduler'

export default class MessageCreateEvent extends BaseEvent {
  readonly expMin: number
  readonly expMax: number
  readonly timeMin: number
  readonly timeMax: number

  constructor(gurun: MechaGurun) {
    super(gurun, 'messageCreate')
    this.expMin = gurun.config.profiles?.exp_min ?? DEFAULT_CONFIG.profiles!.exp_min!
    this.expMax = gurun.config.profiles?.exp_max ?? DEFAULT_CONFIG.profiles!.exp_max!
    this.timeMax =
      gurun.config.profiles?.exp_timeout_max ?? DEFAULT_CONFIG.profiles!.exp_timeout_max!
    this.timeMin =
      gurun.config.profiles?.exp_timeout_min ?? DEFAULT_CONFIG.profiles!.exp_timeout_min!
  }

  async reward(message: Message): Promise<void> {
    const memberId = message.author.id
    const guildId = message.guild!.id
    const locale = message.guild!.preferredLocale
    if (!this.gurun.scheduler.hasTask(memberId)) {
      const increment = Math.max(Math.ceil(this.expMax * Math.random()), this.expMin)
      await this.gurun.db.member.upsert({
        create: {
          memberId,
          guildId,
          nickname: message.member?.nickname,
          username: message.author.username,
          experience: increment,
        },
        update: {
          nickname: message.member?.nickname,
          activeAt: new Date(),
          experience: { increment },
        },
        where: { memberId },
      })
      await message.reply({
        content: i18next.t('quip.reward', { exp: increment, lng: locale }),
      })
      logger.info(`rewarding '${message.author.username}#${memberId}' ${increment} experience`)
    }
    await this.gurun.scheduler.updateTask(memberId, this.name, {
      args: [message.author.toJSON() as User],
      time: Math.max(this.timeMax * Math.random(), this.timeMin),
    })
  }

  async runTask(task: SchedulerTask, user: User): Promise<void> {
    logger.info(`rewards are now available for '${user.username}#${user.id}'!`)
  }

  async run(message: Message): Promise<void> {
    if (!message.author.bot && message.guild !== null) {
      await this.reward(message)
    }
  }
}
