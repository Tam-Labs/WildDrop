import { FastifyPluginAsync } from 'fastify'
import { Wallet } from '../models/wallet.js'
import { encodeAddress } from '@polkadot/util-crypto'
import fp from 'fastify-plugin'

interface IBalanceSchema {
  Params: { publicKey: string }
}

interface IUpdateSchema {
  Params: { publicKey: string }
  Body: { balance: number }
}

interface IRegisterSchema {
  Params: { publicKey: string }
}

const wallet: FastifyPluginAsync = async (fastify) => {
  const hooks = { onRequest: [fastify.authenticate], onSend: [fastify.encryptPayload] }

  fastify.get('/wallet', hooks, async (request) => {
    const wallets = await request.orm.em.getRepository(Wallet).findAll({ fields: ['publicKey'] })

    const keys = wallets.map((wallet) => wallet.publicKey)

    return { keys }
  })

  fastify.post<IRegisterSchema>('/wallet/:publicKey', hooks, async (request, reply) => {
    const { publicKey } = request.params

    await request.orm.em.getRepository(Wallet).ensureExists(publicKey)

    return reply.status(201).send()
  })

  fastify.get<IBalanceSchema>('/wallet/:publicKey', hooks, async (request) => {
    const { publicKey } = request.params

    const balance = await request.az.query<number>('balanceOf', publicKey)

    return { balance }
  })

  fastify.put<IUpdateSchema>('/wallet/:publicKey', hooks, async (request, reply) => {
    const { publicKey } = request.params
    const { balance } = request.body

    const address = encodeAddress('0x' + publicKey)

    await request.orm.em.getRepository(Wallet).ensureExists(publicKey)

    await request.az.transact('update', address, balance)

    return reply.status(201).send()
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(wallet)
