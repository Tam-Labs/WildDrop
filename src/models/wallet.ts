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

  @PrimaryKey()
  id!: number

  /**
   * Public key associated with the wallet.
   * @type {string}
   */
  @Property({ type: 'text' })
  address!: string

  /**
   * Private key associated with the wallet.
   * @type {string}
   */
  @Property({ type: 'text' })
  privateKey!: string

  /**
   * Creates a new instance of Wallet.
   * @constructor
   * @param {string} publicKey - The public key associated with the wallet.
   * @param {string} privateKey - The private key associated with the wallet.
   */
  constructor(address: string, privateKey: string) {
    super()

    this.address = address
    this.privateKey = privateKey
  }
}
