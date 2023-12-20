export interface SchedulerTaskOptions {
  persist?: boolean
  time: number
}

export interface SchedulerTask {
  opts: SchedulerTaskOptions
  timeout: NodeJS.Timeout
}

export default class Scheduler {
  readonly tasks = new Map<string, SchedulerTask>()

  add(name: string, opts: SchedulerTaskOptions): void {
    this.tasks.set(name, {
      opts,
      timeout: setTimeout(() => {
        this.remove(name)
      }, opts.time),
    })
  }

  upsert(name: string, opts: SchedulerTaskOptions): void {
    const task = this.tasks.get(name)
    if (typeof task !== 'undefined') {
      this.removeTask(name, task)
      this.add(name, opts)
    } else {
      this.add(name, opts)
    }
  }

  removeTask(name: string, task: SchedulerTask): void {
    clearTimeout(task.timeout)
    this.tasks.delete(name)
  }

  remove(name: string): void {
    const task = this.tasks.get(name)
    if (typeof task !== 'undefined') {
      this.removeTask(name, task)
    }
  }

  has(name: string): boolean {
    return this.tasks.has(name)
  }
}
