import { Entity, EntityRepositoryType, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core'
import { SessionRepository } from '../repositories/session.js'
import { Model } from './model.js'
import dayjs from 'dayjs'
import { AuthKey } from './auth-key.js'

/**
 * Represents a Session entity storing public key.
 * @class
 * @extends Model
 * @property {string} publicKey - Public key.
 */
@Entity({ repository: () => SessionRepository })
export class Session extends Model {
  /**
   * Type definition for the repository associated with this entity.
   */
  [EntityRepositoryType]?: SessionRepository

  @PrimaryKey({ type: 'text', nullable: false })
  hash!: string

  /**
   * Public key of allowed connection in hex format.
   * @type {string}
   */
  @ManyToOne(() => AuthKey)
  authKey!: AuthKey

  @Property({ nullable: false })
  expire: Date

  get expired() {
    return dayjs().isAfter(this.expire)
  }

  /**
   * Creates a new instance of Session.
   * @constructor
   * @param {string} publicKey - The public key of allowed connection.
   */
  constructor(hash: string, authKey: AuthKey, expire: Date) {
    super()

    this.hash = hash
    this.authKey = authKey
    this.expire = expire
  }
}
