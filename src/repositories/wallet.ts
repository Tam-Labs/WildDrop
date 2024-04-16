import { EntityRepository } from '@mikro-orm/postgresql'
import { Wallet } from '../models/wallet.js'

export class WalletRepository extends EntityRepository<Wallet> {
  async exists(address: string) {
    const count = await this.qb().where({ address }).getCount()
    return count > 0
  }
}
