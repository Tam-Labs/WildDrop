import { Entity, EntityRepositoryType, PrimaryKey, Property } from '@mikro-orm/core'
import { WalletRepository } from '../repositories/wallet.js'
import { Model } from './model.js'

/**
 * Represents a Wallet entity storing public and private keys.
 * @class
 * @extends Model
 * @property {string} publicKey - Public key associated with the wallet.
 * @property {string} privateKey - Private key associated with the wallet.
 */
@Entity({ repository: () => WalletRepository })
export class Wallet extends Model {
  /**
   * Type definition for the repository associated with this entity.
   */
  [EntityRepositoryType]?: WalletRepository

  /**
   * Address associated with the wallet (in hex format).
   * @type {string}
   */
  @PrimaryKey({ type: 'text' })
  publicKey!: string

  /**
   * Creates a new instance of Wallet.
   * @constructor
   * @param publicKey - publicKey associated with the wallet.
   */
  constructor(publicKey: string) {
    super()

    this.publicKey = publicKey
  }
}
