import { EntityRepository } from '@mikro-orm/postgresql'
import { Wallet } from '../models/wallet.js'

export class WalletRepository extends EntityRepository<Wallet> {
  async getOrAdd(publicKey: string) {
    const wallet = await this.findOne({ publicKey })
    if (wallet) {
      return wallet
    }

    const newWallet = new Wallet(publicKey)
    await this.em.persist(newWallet).flush()
    return newWallet
  }

  async ensureExists(publicKey: string) {
    await this.getOrAdd(publicKey)
  }

  async exists(publicKey: string) {
    const count = await this.qb().where({ publicKey }).getCount()
    return count > 0
  }
}
