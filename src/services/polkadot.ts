import { ed25519PairFromRandom } from '@polkadot/util-crypto'
import { isReady, waitReady } from '@polkadot/wasm-crypto'
import { toHex } from './crypto.js'

/**
 * Generates a random Ed25519 key pair for cryptographic operations.
 * @function generateKeyPair
 * @async
 * @returns {Promise<{ publicKey: string, privateKey: string }>} A promise that resolves to an object containing the generated public and private keys in hexadecimal format.
 */
export const generateKeyPair = async () => {
  // Ensure the cryptographic libraries are ready for use.
  if (!isReady()) {
    await waitReady()
  }

  // Generate a random Ed25519 key pair.
  const pair = ed25519PairFromRandom()

  // Convert the public and private keys to hexadecimal format and return them.
  return {
    publicKey: toHex(pair.publicKey),
    privateKey: toHex(pair.secretKey),
  }
}
