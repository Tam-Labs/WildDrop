import { EntityRepository } from '@mikro-orm/postgresql'
import { Session } from '../models/session.js'

export class SessionRepository extends EntityRepository<Session> {
  async exists(publicKey: string) {
    const count = await this.qb().where({ publicKey }).getCount()
    return count > 0
  }
}
