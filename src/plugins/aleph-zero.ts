import { FastifyPluginAsync } from 'fastify'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { BN, BN_ONE } from '@polkadot/util'
import { WeightV2 } from '@polkadot/types/interfaces'
import { ContractPromise } from '@polkadot/api-contract'
import { KeyringPair$Json } from '@polkadot/keyring/types'
import { readFileAsync } from '../services/fs-utils.js'
import { parseJsonFromFile } from '../services/json-utils.js'
import { AZ_URL, AZ_CONTRACT, AZ_ACCOUNT_PATH, AZ_METADATA_PATH, AZ_PASSPHRASE } from '../config.js'
import fp from 'fastify-plugin'

interface AlephZero {
  account: KeyringPair$Json
  contract: ContractPromise
  readOnlyGasLimit: WeightV2

  query<T = unknown>(name: string, ...params: unknown[]): Promise<T>
  transact(name: string, ...params: unknown[]): Promise<void>
}

declare module 'fastify' {
  interface FastifyRequest {
    az: AlephZero
  }
}

const alephZero: FastifyPluginAsync = async (fastify) => {
  const provider = new WsProvider(AZ_URL)
  const api = await ApiPromise.create({ provider })

  const metadata = await readFileAsync(AZ_METADATA_PATH)
  const account = await parseJsonFromFile<KeyringPair$Json>(AZ_ACCOUNT_PATH)

  const keyPair = new Keyring().createFromJson(account)
  keyPair.unlock(AZ_PASSPHRASE)

  const contract = new ContractPromise(api, metadata, AZ_CONTRACT)

  const readOnlyGasLimit = api.registry.createType('WeightV2', {
    refTime: new BN(1_000_000_000_000),
    proofSize: new BN(5_000_000_000_000).isub(BN_ONE),
  }) as WeightV2

  const query = async (name: string, ...params: unknown[]) => {
    const result = await contract.query[name](account.address, { gasLimit: readOnlyGasLimit }, ...params)

    if (result.result.isOk) {
      const data = result.output.toPrimitive()
      if (Object.keys(data).includes('ok')) {
        return data['ok']
      }
      return data
    }

    return null
  }

  async function transact(name: string, ...params: unknown[]) {
    const { gasRequired } = await contract.query[name](account.address, { gasLimit: readOnlyGasLimit }, ...params)

    const options = {
      gasLimit: api.registry.createType('WeightV2', gasRequired) as WeightV2,
    }

    await contract.tx[name](options, ...params).signAndSend(keyPair)
  }

  const alephZero: AlephZero = { contract, account, readOnlyGasLimit, query, transact }

  fastify.addHook('onRequest', async (request) => {
    request.az = alephZero
  })

  fastify.addHook('onClose', async () => {
    await api.disconnect()
    await provider.disconnect()
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(alephZero)
