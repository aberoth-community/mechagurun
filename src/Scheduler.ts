import { EventEmitter } from 'events'
import logger from './util/logger'
import type { ClientEvents } from 'discord.js'
import type MechaGurun from './MechaGurun'
import type { Prisma } from '@prisma/client'

/** Scheduler task options */
export interface SchedulerTaskOptions {
  args?: Prisma.InputJsonArray | null
  immediate?: boolean
  loop?: boolean
  persist?: boolean
  time: number
}

/** Scheduled task */
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

  private _createDate(ms: number): Date {
    return new Date(Date.now() + ms)
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
            this.emit('task_end', task)
            if (opts.loop === true) {
              await this.updateTask(name, event, opts)
            } else {
              await this.removeTask(name)
            }
          })
          .catch((err): void => {
            logger.error(`scheduler failed to emit task '${name}!`, err)
          })
      }, opts.time),
    }
    return task
  }

  emit(event: 'task_end', task: SchedulerTask): boolean {
    return super.emit(event, task)
  }

  on(event: 'task_end', listener: (task: SchedulerTask, ...args: unknown[]) => void): this {
    return super.on(event, listener)
  }

  hasTask(name: string): boolean {
    return this.tasks.has(name)
  }

  getTask(name: string): SchedulerTask | undefined {
    return this.tasks.get(name)
  }

  /**
   * Add new task
   * @param name   unique task name
   * @param event  event name
   * @param opts   task options
   * @returns      scheduler task
   */
  async addTask(
    name: string,
    event: keyof ClientEvents,
    opts: SchedulerTaskOptions,
  ): Promise<SchedulerTask> {
    if (this.hasTask(name)) {
      return this.tasks.get(name)!
    }
    const task = this._createTask(name, event, opts)
    this.tasks.set(name, task)
    if (opts.immediate === true) {
      this.emit('task_end', task)
    }
    // persist task
    if (opts.persist === true) {
      await this.gurun.db.scheduledTask.create({
        data: {
          args: opts.args,
          event,
          name,
          time: this._createDate(opts.time),
        },
      })
    }
    return task
  }

  /**
   * Update or create task
   * @param name  task name
   * @param event task event
   * @param opts  task options
   * @returns     task
   */
  async updateTask(
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
          event,
          name,
          args: opts.args,
          time: this._createDate(opts.time),
        },
        update: {
          args: opts.args,
          createdAt: new Date(),
          time: this._createDate(opts.time),
        },
        where: { name },
      })
    }
    this.tasks.set(name, task)
    return task
  }

  /**
   * Remove task by name
   * @param name task name
   */
  async removeTask(name: string): Promise<void> {
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
  async restoreTasks(): Promise<SchedulerTask[]> {
    const tasks = await this.gurun.db.scheduledTask.findMany({})
    return await Promise.all(
      tasks.map(async ({ args, event, name, time }): Promise<SchedulerTask> => {
        const task = this._createTask(name, event as keyof ClientEvents, {
          time: time.getTime() - Date.now(),
          args: args as Prisma.InputJsonArray,
          persist: true,
        })
        this.tasks.set(name, task)
        return task
      }),
    )
  }
}
