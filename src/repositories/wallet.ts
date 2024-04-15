import { EntityRepository } from '@mikro-orm/postgresql'
import { Wallet } from '../models/wallet.js'

export class WalletRepository extends EntityRepository<Wallet> {
  async exists(publicKey: string) {
    const count = await this.qb().where({ publicKey }).getCount()
    return count > 0
  }
}
