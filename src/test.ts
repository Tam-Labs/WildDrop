// Import the API, Keyring and some utility functions
import { ApiPromise, WsProvider } from '@polkadot/api'
import { Keyring } from '@polkadot/keyring'
import { AZ_URL } from './config.js'
import { BN } from 'bn.js'
import { Balance } from '@polkadot/types/interfaces'
import { createKeyMulti, encodeAddress, sortAddresses, encodeMultiAddress } from '@polkadot/util-crypto'
import { Multisig, Timepoint } from '@polkadot/types/interfaces'
import { Option } from '@polkadot/types'

const addresses = [
  '5HTZov4QQw8CsABNF7A94SfVan4e4Qm6jwnpj5jCM6xxYTJX',
  '5E2WAffwXApUAEBJQYzCPURhJzxuFjLJK16u8msiCGko92ni',
  '5HQQABV9h5552vhXScsEQJhwFJBqUATPBSZYPTyCQiNzxgQG',
]

const test = encodeMultiAddress(addresses, 2)

// console.log('test: ' + test)
// console.log(sortAddresses(addresses))

async function main() {
  const provider = new WsProvider(AZ_URL)

  //   // Instantiate the API
  const api = await ApiPromise.create({ provider })

  const transfer = api.tx.balances.transferAllowDeath(addresses[0], new BN('0'))

  const [info, { weight }] = await Promise.all([
    api.query.multisig.multisigs<Option<Multisig>>(addresses[0], transfer.method.hash),
    transfer.paymentInfo(addresses[0]) as Promise<{ weight: any }>,
  ])

  let timepoint: Timepoint | null = null
  if (info.isSome) {
    timepoint = info.unwrap().when
  }

  const tx2 = api.tx.multisig.asMulti(2, addresses, timepoint, transfer.method.toHex(), weight)

  api.tx.multisig.asMulti(2, addresses, timepoint, transfer.method.toHex(), weight)

  console.log(weight.toHuman())
  // const test = await  transfer.signAsync(new Keyring().createFromUri('asdasd'));
}
main()

// // Take addresses and remove the sender.
// const otherSignatories = addresses.filter((who) => who !== addresses[0])

// // Sort them by public key.
// const otherSignatoriesSorted = sortAddresses(otherSignatories, 0)

// console.log(otherSignatoriesSorted)

// const DEMTEST = '5E2WAffwXApUAEBJQYzCPURhJzxuFjLJK16u8msiCGko92ni'

// async function main() {
//   console.log(AZ_URL)

//   const provider = new WsProvider(AZ_URL)

//   // Instantiate the API
//   const api = await ApiPromise.create({ provider })

//   // Construct the keyring after the API (crypto has an async init)
//   const keyring = new Keyring({ type: 'sr25519' })

//   // Add Alice to our keyring with a hard-derivation path (empty phrase, so uses dev)
//   const tubbly = keyring.addFromUri('sausage kitten art warfare plug funny address hedgehog armor lift turkey copy')

//   const result = await api.query.system.account(tubbly.address)

//   const test = await api.query.system.account(tubbly.address)

//   console.log(test.toString())

//   console.log(new BN((result as any).data.free).div(new BN('1000000000000')).toString())
//   // Create a extrinsic, transferring 12345 units to Bob
//   // const transfer = api.tx.balances.transferAllowDeath(DEMTEST, new BN('1000000000000'))

//   // Sign and send the transaction using our account
//   // await transfer.signAndSend(tubbly, (result) => console.log(result.status?.toHuman()))

//   //console.log('Transfer sent with hash', hash.toHex())
// }

// main()
//   .catch(console.error)
//   .finally(() => process.exit())
