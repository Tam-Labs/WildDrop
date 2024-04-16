import { createCipheriv, createDecipheriv } from 'node:crypto'
import { generateHMAC } from './hmac.js'

export async function generateAES256Key(): Promise<Buffer> {
  return await generateHMAC(256)
}

export async function generateAES256IV(): Promise<Buffer> {
  return await generateHMAC(128)
}

export async function generateAES256KeyIV(): Promise<[Buffer, Buffer]> {
  const key = await generateAES256Key()
  const iv = await generateAES256IV()

  return [key, iv]
}

export async function encryptAES256(data: Buffer, key: Buffer, iv: Buffer) {
  const cipher = createCipheriv('aes-256-cbc', key, iv)

  const encrypted = cipher.update(data)
  const final = cipher.final()

  return Buffer.concat([encrypted, final])
}

export async function decryptAES(encrypted: Buffer, key: Buffer, iv: Buffer) {
  const decipher = createDecipheriv('aes-256-cbc', key, iv)

  const decrypted = decipher.update(encrypted)
  const final = decipher.final()

  return Buffer.concat([decrypted, final])
}
