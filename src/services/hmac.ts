import { generateKey } from 'node:crypto'

export async function generateHMAC(length: number) {
  return new Promise<Buffer>((resolve, reject) => {
    generateKey('hmac', { length }, (err, key) => {
      if (!err) {
        resolve(key.export())
      } else {
        reject(err)
      }
    })
  })
}
