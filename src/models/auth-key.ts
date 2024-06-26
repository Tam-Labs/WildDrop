import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { AuthKeyRepository } from '../repositories/auth-key.js'
import { Model } from './model.js'

/**
 * Represents a AuthKey entity storing public key.
 * @class
 * @extends Model
 * @property {string} publicKey - Public key.
 */
@Entity({ repository: () => AuthKeyRepository })
export class AuthKey extends Model {
  /**
   * Type definition for the repository associated with this entity.
   */
  [EntityRepositoryType]?: AuthKeyRepository

  @PrimaryKey()
  id!: number

  /**
   * Public key of allowed connection in hex format.
   * @type {string}
   */
  @Property({ type: 'text', nullable: false })
  publicKey!: string

  /**
   * Creates a new instance of AuthKey.
   * @constructor
   * @param {string} publicKey - The public key of allowed connection.
   */
  constructor(publicKey: string) {
    super()

    this.publicKey = publicKey
  }
}
