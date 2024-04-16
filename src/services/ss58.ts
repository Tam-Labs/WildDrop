import { blake2b } from 'blakejs'
import bs58 from 'bs58'

// @see https://github.com/polkadot-js/ss58/blob/master/index.js

export async function encodeSS58(publicKey: Uint8Array): Promise<string> {
  if (publicKey.length != 32) {
    return null
  }
  const bytes = new Uint8Array([42, ...publicKey])
  const hash = blake2b(bytes)
  const complete = new Uint8Array([...bytes, hash[0], hash[1]])
  return bs58.encode(complete)
}

export async function decodeSS58(address: string): Promise<Uint8Array> {
  const a = bs58.decode(address)

  if (a[0] == 42) {
    if (a.length == 32 + 1 + 2) {
      const address = a.slice(0, 33)
      const hash = blake2b(address)
      if (a[33] == hash[0] && a[34] == hash[1]) {
        return address.slice(1)
      } else {
        // invalid checksum
        return null
      }
    } else {
      // Invalid length.
      return null
    }
  } else {
    // Invalid version.
    return null
  }
}
