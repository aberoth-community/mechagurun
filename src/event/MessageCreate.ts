import Event from './BaseEvent'
import i18next from 'i18next'
import logger from '../util/logger'
import type { Message, User } from 'discord.js'
import type MechaGurun from '../MechaGurun'
import type { SchedulerTask } from 'src/Scheduler'

export default class MessageCreateEvent extends Event {
  static DEFAULT_EXP_MAX = 64
  static DEFAULT_EXP_MIN = 6
  static DEFAULT_TIMEOUT_MIN = 10e3
  static DEFAULT_TIMEOUT_MAX = 240e3

  readonly expMin: number
  readonly expMax: number
  readonly timeMin: number
  readonly timeMax: number

  constructor(gurun: MechaGurun) {
    super(gurun, 'messageCreate')
    this.expMin = gurun.config.profiles?.exp_min ?? MessageCreateEvent.DEFAULT_EXP_MIN
    this.expMax = gurun.config.profiles?.exp_max ?? MessageCreateEvent.DEFAULT_EXP_MAX
    this.timeMax = gurun.config.profiles?.exp_timeout_max ?? MessageCreateEvent.DEFAULT_TIMEOUT_MAX
    this.timeMin = gurun.config.profiles?.exp_timeout_min ?? MessageCreateEvent.DEFAULT_TIMEOUT_MIN
  }

  async reward(message: Message): Promise<void> {
    const memberId = message.author.id
    const guildId = message.guild!.id
    const locale = message.guild!.preferredLocale
    if (!this.gurun.scheduler.has(memberId)) {
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
      logger.debug(`rewarding '${message.author.username}#${memberId}' ${increment} experience`)
    }
    await this.gurun.scheduler.upsert(memberId, this.name, {
      args: [message.author.toJSON() as User],
      end: new Date(Date.now() + Math.max(Math.floor(this.timeMax * Math.random()), this.timeMin)),
    })
  }

  async task(task: SchedulerTask, user: User): Promise<void> {
    logger.debug(`rewards are now available for '${user.username}#${user.id}'!`)
  }

  async run(message: Message): Promise<void> {
    if (!message.author.bot && message.guild !== null) {
      await this.reward(message)
    }
  }
}
