import { FastifyPluginAsync } from 'fastify'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { BN, BN_ONE } from '@polkadot/util'
import { WeightV2 } from '@polkadot/types/interfaces'
import { ContractPromise } from '@polkadot/api-contract'
import { KeyringPair$Json } from '@polkadot/keyring/types'
import { readFileAsync } from '../services/fs-utils.js'
import { parseJsonFromFile } from '../services/json-utils.js'
import { AZ_URL, AZ_CONTRACT, AZ_ACCOUNT_PATH, AZ_METADATA_PATH } from '../config.js'
import fp from 'fastify-plugin'

interface IBody {
  queryName: string
  arguments: unknown[]
}

interface IQuerySchema {
  Body: IBody
}

const alephZero: FastifyPluginAsync = async (fastify) => {
  const defaultOptions = { onRequest: [fastify.authenticate], onSend: [fastify.encryptPayload] }

  const provider = new WsProvider(AZ_URL)
  const api = await ApiPromise.create({ provider })

  const metadata = await readFileAsync(AZ_METADATA_PATH)
  const account = await parseJsonFromFile<KeyringPair$Json>(AZ_ACCOUNT_PATH)

  const contract = new ContractPromise(api, metadata, AZ_CONTRACT)

  const readOnlyGasLimit = api.registry.createType('WeightV2', {
    refTime: new BN(1_000_000_000_000),
    proofSize: new BN(5_000_000_000_000).isub(BN_ONE),
  }) as WeightV2

  fastify.post<IQuerySchema>('/aleph-zero', defaultOptions, async (request, reply) => {
    const query = contract.query[request.body.queryName]
    if (!query) {
      return reply.status(500).send('Unknown query')
    }

    try {
      const result = await query(account.address, { gasLimit: readOnlyGasLimit }, ...request.body.arguments)

      if (result.result.isOk) {
        const data = result.output.toPrimitive()

        return { result: data['ok'] }
      } else {
        return reply.status(500).send()
      }
    } catch (err) {
      console.log(err)
      return reply.status(500).send(err)
    }
  })

  fastify.addHook('onClose', async () => {
    await api.disconnect()
    await provider.disconnect()
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(alephZero)
