import { EventEmitter } from 'events'
import logger from './util/logger'
import type { ClientEvents } from 'discord.js'
import type MechaGurun from './MechaGurun'
import type { Prisma } from '@prisma/client'

export interface SchedulerTaskOptions {
  args?: Prisma.InputJsonArray | null
  end: Date
  persist?: boolean
}

export interface SchedulerTask {
  opts: SchedulerTaskOptions
  event: keyof ClientEvents
  name: string
  timeout: NodeJS.Timeout
}

/**
 * Bot scheduler
 * @class
 */
export default class Scheduler extends EventEmitter {
  readonly tasks = new Map<string, SchedulerTask>()
  readonly gurun: MechaGurun

  constructor(gurun: MechaGurun) {
    super()
    this.gurun = gurun
  }

  private _createTask(
    name: string,
    event: keyof ClientEvents,
    opts: SchedulerTaskOptions,
  ): SchedulerTask {
    const task: SchedulerTask = {
      event,
      name,
      opts,
      timeout: setTimeout(() => {
        Promise.resolve()
          .then(async () => {
            this.emit('task_end', task, opts.args)
            await this.remove(name)
          })
          .catch((err): void => {
            logger.error(`scheduler failed to emit task '${name}!`, err)
          })
      }, opts.end.getTime() - Date.now()),
    }
    return task
  }

  emit(event: 'task_end', task: SchedulerTask, args?: Prisma.InputJsonArray | null): boolean {
    return super.emit(event, task, ...(args ?? []))
  }

  on(event: 'task_end', listener: (task: SchedulerTask, ...args: unknown[]) => void): this {
    return super.on(event, listener)
  }

  has(name: string): boolean {
    return this.tasks.has(name)
  }

  async add(
    name: string,
    event: keyof ClientEvents,
    opts: SchedulerTaskOptions,
  ): Promise<SchedulerTask> {
    const task = this._createTask(name, event, opts)
    if (opts.persist === true) {
      await this.gurun.db.scheduledTask.create({
        data: {
          args: opts.args,
          end: opts.end,
          event,
          name,
        },
      })
    }
    this.tasks.set(name, task)
    return task
  }

  /**
   * Update or insert task
   * @param name  Task name
   * @param event Task event
   * @param opts  Task options
   * @returns     Task
   */
  async upsert(
    name: string,
    event: keyof ClientEvents,
    opts: SchedulerTaskOptions,
  ): Promise<SchedulerTask> {
    const old = this.tasks.get(name)
    if (typeof old !== 'undefined') {
      clearInterval(old.timeout)
    }
    const task = this._createTask(name, event, opts)
    if (opts.persist === true) {
      await this.gurun.db.scheduledTask.upsert({
        create: {
          end: opts.end,
          event,
          name,
          args: opts.args,
        },
        update: {
          args: opts.args,
          createdAt: new Date(),
          end: opts.end,
        },
        where: { name },
      })
    }
    this.tasks.set(name, task)
    return task
  }

  async remove(name: string): Promise<void> {
    const task = this.tasks.get(name)
    if (typeof task !== 'undefined') {
      clearTimeout(task.timeout)
      if (task.opts.persist === true) {
        await this.gurun.db.scheduledTask.delete({
          where: { name },
        })
      }
      this.tasks.delete(name)
    }
  }

  /** Restore tasks */
  async restore(): Promise<SchedulerTask[]> {
    const tasks = await this.gurun.db.scheduledTask.findMany({})
    return await Promise.all(
      tasks.map(async ({ args, end, event, name }): Promise<SchedulerTask> => {
        const task = this._createTask(name, event as keyof ClientEvents, {
          end,
          args: args as Prisma.InputJsonArray,
          persist: true,
        })
        this.tasks.set(name, task)
        return task
      }),
    )
  }
}
