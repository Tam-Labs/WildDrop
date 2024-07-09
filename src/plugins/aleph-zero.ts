import { FastifyPluginAsync } from 'fastify'
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { BN, BN_ONE } from '@polkadot/util'
import { WeightV2 } from '@polkadot/types/interfaces'
import { ContractPromise } from '@polkadot/api-contract'
import { KeyringPair$Json, KeyringPair } from '@polkadot/keyring/types'
import { readFileAsync } from '../services/fs-utils.js'
import { parseJsonFromFile } from '../services/json-utils.js'
import {
  AZ_URL,
  AZ_CONTRACT,
  AZ_ACCOUNT_PATH,
  AZ_METADATA_PATH,
  AZ_PASSPHRASE,
  AZ_ACCOUNT,
  AZ_METADATA,
} from '../config.js'
import fp from 'fastify-plugin'

export interface AlephZero {
  account: KeyringPair
  contract: ContractPromise
  readOnlyGasLimit: WeightV2

  query<T = unknown>(name: string, ...params: unknown[]): Promise<T>
  queryAs<T = unknown>(address: string, name: string, ...params: unknown[]): Promise<T>
  transact(name: string, ...params: unknown[]): Promise<void>
  transactAs(pair: KeyringPair, name: string, ...params: unknown[]): Promise<void>
  getBalance(address: string): Promise<BN>
  transfer(address: string, amount: BN): Promise<void>
}

declare module 'fastify' {
  interface FastifyRequest {
    az: AlephZero
  }
}

async function createKeyringPair(): Promise<KeyringPair> {
  if (AZ_ACCOUNT) {
    const json = JSON.parse(Buffer.from(AZ_ACCOUNT, 'base64').toString('utf8'))

    return new Keyring().createFromJson(json)
  } else {
    const json = await parseJsonFromFile<KeyringPair$Json>(AZ_ACCOUNT_PATH)

    return new Keyring().createFromJson(json)
  }
}

async function loadMetadata(): Promise<string> {
  if (AZ_METADATA) {
    return Buffer.from(AZ_ACCOUNT, 'base64').toString('utf8')
  } else {
    return await readFileAsync(AZ_METADATA_PATH)
  }
}

const alephZero: FastifyPluginAsync = async (fastify) => {
  const provider = new WsProvider(AZ_URL)
  const api = await ApiPromise.create({ provider })

  const metadata = await loadMetadata()
  const account = await createKeyringPair()
  account.unlock(AZ_PASSPHRASE)

  const contract = new ContractPromise(api, metadata, AZ_CONTRACT)

  const readOnlyGasLimit = api.registry.createType('WeightV2', {
    refTime: new BN(1_000_000_000_000),
    proofSize: new BN(5_000_000_000_000).isub(BN_ONE),
  }) as WeightV2

  const queryAs = async (address: string, name: string, ...params: unknown[]) => {
    const result = await contract.query[name](address, { gasLimit: readOnlyGasLimit }, ...params)

    if (result.result.isOk) {
      const data = result.output.toPrimitive()
      if (Object.keys(data).includes('ok')) {
        return data['ok']
      }
      return data
    }

    return null
  }

  const query = async (name: string, ...params: unknown[]) => {
    return await queryAs(account.address, name, ...params)
  }

  async function transactAs(keyringPair: KeyringPair, name: string, ...params: unknown[]) {
    const { gasRequired } = await contract.query[name](keyringPair.address, { gasLimit: readOnlyGasLimit }, ...params)

    return new Promise<void>((resolve, reject) => {
      const options = {
        gasLimit: api.registry.createType('WeightV2', gasRequired) as WeightV2,
      }

      contract.tx[name](options, ...params).signAndSend(keyringPair, (result) => {
        if (result.isError) {
          reject()
        } else if (result.status.isFinalized) {
          resolve()
        }
      })
    })
  }

  async function transact(name: string, ...params: unknown[]) {
    return await transactAs(account, name, ...params)
  }

  async function getBalance(address: string): Promise<BN> {
    const { data: balance } = (await api.query.system.account(address)) as any

    return new BN(balance.free)
  }

  async function transfer(address: string, amount: BN): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      api.tx.balances.transferAllowDeath(address, amount).signAndSend(account, (result) => {
        if (result.isError) {
          reject()
        } else if (result.status.isFinalized) {
          resolve()
        }
      })
    })
  }

  const alephZero: AlephZero = {
    contract,
    account,
    readOnlyGasLimit,
    query,
    queryAs,
    transact,
    transactAs,
    getBalance,
    transfer,
  }

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
