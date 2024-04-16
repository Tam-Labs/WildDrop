import { webcrypto } from 'node:crypto'
import * as ed from '@noble/ed25519'

// @ts-ignore
if (!globalThis.crypto) globalThis.crypto = webcrypto

export async function generateED25519(): Promise<Uint8Array> {
  return ed.utils.randomPrivateKey()
}

export async function getPublicED25519(privateKey: Uint8Array): Promise<Uint8Array> {
  return await ed.getPublicKeyAsync(privateKey)
}
