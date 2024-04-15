import { readFile } from 'node:fs'

export const readFileAsync = async (path: string) => {
  return new Promise<string>((resolve, reject) => {
    readFile(path, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}
