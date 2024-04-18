import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify'
import { generateHMAC } from '../services/hmac.js'
import { encryptAES256, generateAES256KeyIV } from '../services/aes256.js'
import { AuthKey } from '../models/auth-key.js'
import { KeyObject, createPublicKey, publicEncrypt } from 'crypto'
import { RSA_PKCS1_PADDING } from 'node:constants'
import { z } from 'zod'
import fp from 'fastify-plugin'
import { Session } from '../models/session.js'
import dayjs from 'dayjs'
import { SESSION_EXPIRE } from '../config.js'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
    encryptPayload(request: FastifyRequest, reply: FastifyReply, payload: unknown): Promise<Buffer>
  }

  interface FastifyRequest {
    sessionHashHex: string
    authKeyId: number
    publicKey: KeyObject
    encrypt(data: Buffer): Buffer
  }
}

const authSchema = z.string()

const auth: FastifyPluginAsync = async (fastify) => {
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const sessionHashHex = request.headers['wd-session']
      if (!sessionHashHex || Array.isArray(sessionHashHex)) {
        return reply.status(401).send('Session hash is not provided.')
      }

      const session = await request.orm.em
        .getRepository(Session)
        .findOne({ hash: sessionHashHex }, { populate: ['authKey'] })
      if (!session) {
        return reply.status(401).send('Incorrect session hash')
      }

      if (session.expired) {
        return reply.status(403).send('Session has been expired.')
      }

      const publicKeyDerHex = session.authKey.publicKey
      if (!publicKeyDerHex) {
        return reply.status(403).send('Missing public key')
      }

      const publicKeyDer = Buffer.from(session.authKey.publicKey, 'hex')

      request.sessionHashHex = sessionHashHex
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
    if (payload === null || payload === undefined) {
      return null
    }

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

    const [key, iv] = await generateAES256KeyIV()

    const encryptedData = await encryptAES256(buffer, key, iv)

    const encryptedKey = request.encrypt(key)
    const encryptedIv = request.encrypt(iv)

    reply.header('wd-enc-key', encryptedKey.toString('hex'))
    reply.header('wd-enc-iv', encryptedIv.toString('hex'))

    return encryptedData
  }

  fastify.decorate('authenticate', authenticate)
  fastify.decorate('encryptPayload', encryptPayload)

  fastify.post('/open', async (request, reply) => {
    const publicKeyDerBase64 = authSchema.parse(request.body)

    if (!publicKeyDerBase64) {
      return reply.status(400).send('Public key is not provided.')
    }

    const publicKeyDer = Buffer.from(publicKeyDerBase64, 'base64')

    const publicKeyHex = publicKeyDer.toString('hex')
    if (!publicKeyHex) {
      return reply.status(400).send('Cannot decode public key from base64 format.')
    }

    const authKey = await request.orm.em.getRepository(AuthKey).findOne({ publicKey: publicKeyHex })
    if (!authKey) {
      return reply.status(401).send()
    }

    const publicKey = createPublicKey({
      key: publicKeyDer,
      format: 'der',
      type: 'pkcs1',
    })

    const sessionHash = await generateHMAC(512)
    const sessionHashHex = sessionHash.toString('hex')

    const expire = dayjs().add(SESSION_EXPIRE, 'seconds').toDate()

    const session = new Session(sessionHashHex, authKey, expire)

    await request.orm.em.persist(session).flush()

    const encryptedSessionHash = publicEncrypt({ key: publicKey, padding: RSA_PKCS1_PADDING }, sessionHash)

    return encryptedSessionHash
  })

  fastify.post('/close', { onRequest: [authenticate] }, async (request, reply) => {
    const sessions = await request.orm.em.getRepository(Session).find({ hash: request.sessionHashHex })

    await request.orm.em.remove(sessions).flush()

    return reply.status(201).send()
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(auth)
