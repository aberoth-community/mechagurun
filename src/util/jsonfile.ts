import { readFile, writeFile } from 'fs/promises'

export const read = async <T>(path: string, defaultValue?: T): Promise<T> => {
  try {
    return JSON.parse((await readFile(path)).toString())
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`Failed to read json file at "${path}"!`, err)
    }
    return defaultValue as T
  }
}

export const write = async <T>(path: string, data: T): Promise<void> => {
  try {
    await writeFile(path, JSON.stringify(data))
  } catch (err) {
    console.error(`Failed to write json file at "${path}"!`, err)
  }
}

export default { read, write }
