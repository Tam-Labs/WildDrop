import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { encryptAES, generateHMAC } from '../services/crypto.js'
import { AuthKey } from '../models/auth-key.js'
import { KeyObject, createPublicKey, publicEncrypt } from 'crypto'
import { RSA_PKCS1_PADDING } from 'node:constants'
import { z } from 'zod'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
    encryptPayload(request: FastifyRequest, reply: FastifyReply, payload: unknown): Promise<Buffer>
  }

  interface FastifyRequest {
    publicKey: KeyObject
    encrypt(data: Buffer): Buffer
  }
}

const authSchema = z.string()

const auth: FastifyPluginAsync = async (fastify) => {
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const publicKeyDerBase64 = request.headers['wd-pub-key']

      if (!publicKeyDerBase64 || Array.isArray(publicKeyDerBase64)) {
        return reply.status(403).send()
      }

      const publicKeyDer = Buffer.from(publicKeyDerBase64, 'base64')

      const publicKeyHex = publicKeyDer.toString('hex')
      if (!publicKeyHex) {
        return reply.status(403).send()
      }

      const exists = await request.orm.em.getRepository(AuthKey).exists(publicKeyHex)
      if (!exists) {
        return reply.status(403).send()
      }

      request.publicKey = createPublicKey({
        key: publicKeyDer,
        format: 'der',
        type: 'pkcs1',
      })

      request.encrypt = (data: Buffer) => publicEncrypt({ key: request.publicKey, padding: RSA_PKCS1_PADDING }, data)
    } catch (err) {
      return reply.status(403).send(err)
    }
  }

  const encryptPayload = async (request: FastifyRequest, reply: FastifyReply, payload: unknown) => {
    const buffer = Buffer.isBuffer(payload)
      ? payload
      : typeof payload === 'string'
        ? Buffer.from(payload, 'utf-8')
        : Array.isArray(payload)
          ? Buffer.from(payload)
          : null

    if (!buffer) {
      reply.code(500)
      return null
    }

    const key = await generateHMAC(256)
    const iv = await generateHMAC(128)

    const encryptedData = await encryptAES(buffer, key, iv)

    const encryptedKey = request.encrypt(key)
    const encryptedIv = request.encrypt(iv)

    reply.header('wd-enc-key', encryptedKey.toString('hex'))
    reply.header('wd-enc-iv', encryptedIv.toString('hex'))

    return encryptedData
  }

  fastify.decorate('authenticate', authenticate)
  fastify.decorate('encryptPayload', encryptPayload)
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(auth)
