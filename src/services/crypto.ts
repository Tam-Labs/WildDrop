import { generateKey, createHash, createDecipheriv, createCipheriv } from 'node:crypto'

/**
 * Converts a Uint8Array buffer to its hexadecimal representation.
 * @function toHex
 * @param {Uint8Array | Buffer} buffer - The input buffer to be converted.
 * @returns {string} The hexadecimal representation of the input buffer.
 */
export const toHex = (buffer: Uint8Array | Buffer) => {
  if (buffer instanceof Buffer) {
    return buffer.toString('hex')
  } else {
    return [...buffer].reduce((prev, curr) => prev + curr.toString(16).padStart(2, '0'), '')
  }
}

export const generateHMAC = async (length = 512) =>
  new Promise<Buffer>((resolve, reject) => {
    generateKey('hmac', { length }, (err, key) => {
      if (!err) {
        resolve(key.export())
      } else {
        reject(err)
      }
    })
  })

export const encryptAES = async (data: Buffer, key: Buffer, iv: Buffer) => {
  const cipher = createCipheriv('aes-256-cbc', key, iv)

  const encrypted = cipher.update(data)
  const final = cipher.final()

  return Buffer.concat([encrypted, final])
}

export const generateSHA512 = async () => {
  const hmac = await generateHMAC()
  return createHash('sha512').update(hmac).digest()
}

export const decryptAES = async (encrypted: Buffer, key: Buffer, iv: Buffer) => {
  const decipher = createDecipheriv('aes-256-cbc', key, iv)

  const decrypted = decipher.update(encrypted)
  const final = decipher.final()

  return Buffer.concat([decrypted, final])
}
