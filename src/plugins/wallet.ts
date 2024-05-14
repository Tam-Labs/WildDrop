import { FastifyPluginAsync } from 'fastify'
import { Wallet } from '../models/wallet.js'
import { encodeAddress } from '@polkadot/util-crypto'
import fp from 'fastify-plugin'
import { BN } from '@polkadot/util'
import { AlephZero } from './aleph-zero.js'

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

    const address = encodeAddress('0x' + publicKey)

    const balance = await request.az.query<number>('balanceOf', address)

    return { balance }
  })

  async function updateBalanceAsync(az: AlephZero, publicKey: string, balance: number) {
    const address = encodeAddress('0x' + publicKey)

    const aleph = await az.getBalance(address)

    const MIN_THRESHOLD = new BN('5000000000') // 0.005 AZERO
    const BOOST_AMOUNT = new BN('10000000000') // 0.01 AZERO

    if (aleph.lt(MIN_THRESHOLD)) {
      await az.transfer(address, BOOST_AMOUNT)
    }

    await az.transact('update', balance)
  }

  fastify.put<IUpdateSchema>('/wallet/:publicKey', hooks, async (request, reply) => {
    const { publicKey } = request.params
    const { balance } = request.body

    await request.orm.em.getRepository(Wallet).ensureExists(publicKey)

    updateBalanceAsync(request.az, publicKey, balance)

    console.log('go on')

    return reply.status(204).send()
  })

  fastify.get<IBalanceSchema>('/a0/:publicKey', hooks, async (request) => {
    const { publicKey } = request.params

    const address = encodeAddress('0x' + publicKey)

    const balance = await request.az.getBalance(address)

    // 0.005 in AZERO
    const MIN_THRESHOLD = new BN('5000000000')

    // 0.01 in AZERO
    const MAX_THRESHOLD = new BN('10000000000')
    // console.log(balance.gt)

    return { balance: MAX_THRESHOLD.toString(10) }
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(wallet)
