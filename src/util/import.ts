import { readdir } from 'fs/promises'
import { join } from 'path'

/**
 * Import directory
 * @param dir    Directory path
 * @param each   For each callback
 */
export const importEach = async <T = { default: any }>(
  dir: string,
  each: (v: T, path: string) => void,
): Promise<void> => {
  const next = async (filename: string): Promise<void> => {
    const path = join(dir, filename)
    try {
      each((await import(path)) as T, path)
    } catch (err) {
      console.error(`Failed to import resource at "${path}"!`, err)
    }
  }
  try {
    await Promise.all((await readdir(dir)).map(next))
  } catch (err) {
    console.error(`Failed to read directory at "${dir}"!`, err)
  }
}

export default importEach
