import { FastifyPluginAsync } from 'fastify'
import { generateED25519, getPublicED25519 } from '../services/ed25519.js'
import { Wallet } from '../models/wallet.js'
import { encodeAddress } from '@polkadot/util-crypto'
import fp from 'fastify-plugin'

interface IAddressParamsSchema {
  address: string
}

interface IBalanceSchema {
  Params: IAddressParamsSchema
}

interface IUpdateBodySchema {
  balance: number
}

interface IUpdateSchema {
  Params: IAddressParamsSchema
  Body: IUpdateBodySchema
}

const wallet: FastifyPluginAsync = async (fastify) => {
  const hooks = { onRequest: [fastify.authenticate], onSend: [fastify.encryptPayload] }

  fastify.get('/wallet', hooks, async (request) => {
    const wallets = await request.orm.em.getRepository(Wallet).findAll({ fields: ['address'] })

    return wallets.map((wallet) => wallet.address)
  })

  fastify.get<IBalanceSchema>('/wallet/:address', hooks, async (request, reply) => {
    const { address } = request.params

    const exists = await request.orm.em.getRepository(Wallet).exists(address)
    if (!exists) {
      return reply.status(404).send('No wallet found.')
    }

    const result = await request.az.query<number>('balanceOf', address)

    return result
  })

  fastify.post('/wallet', hooks, async (request) => {
    const privateKey = await generateED25519()
    const publicKey = await getPublicED25519(privateKey)
    const address = encodeAddress(publicKey)

    const privateKeyHex = Buffer.from(privateKey).toString('hex')

    const wallet = new Wallet(address, privateKeyHex)

    await request.orm.em.persist(wallet).flush()

    return wallet.address
  })

  fastify.put<IUpdateSchema>('/wallet/:address', hooks, async (request, reply) => {
    const { address } = request.params
    const { balance } = request.body

    const exists = await request.orm.em.getRepository(Wallet).exists(request.params.address)
    if (!exists) {
      return reply.status(404).send('No wallet found.')
    }

    await request.az.transact('update', address, balance)

    return reply.status(201).send()
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(wallet)
