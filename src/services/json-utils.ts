import { readFileAsync } from './fs-utils.js'

export async function parseJsonFromFile<T>(path: string) {
  const json = await readFileAsync(path)

  return JSON.parse(json) as T
}
