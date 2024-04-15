import { EntityRepository } from '@mikro-orm/postgresql'
import { AuthKey } from '../models/auth-key.js'

export class AuthKeyRepository extends EntityRepository<AuthKey> {
  async exists(publicKey: string) {
    const count = await this.qb().where({ publicKey }).getCount()
    return count > 0
  }
}
