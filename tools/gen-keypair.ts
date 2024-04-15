import { hideBin } from 'yargs/helpers'
import { writeFileSync } from 'node:fs'
import { cwd } from 'node:process'
import { join } from 'node:path'
import { generateKeyPair } from 'crypto'
import yargs from 'yargs'

const argv = await yargs(hideBin(process.argv))
  .option('passphrase', {
    alias: 'p',
    description: 'Passphrase',
    default: undefined,
  })
  .option('output', {
    alias: 'o',
    description: 'Output directory',
    default: './',
  })
  .parse()

generateKeyPair(
  'rsa',
  {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
      cipher: 'aes-256-cbc',
      passphrase: argv.passphrase,
    },
  },
  (err, publicKey, privateKey) => {
    if (!err) {
      writeFileSync(join(cwd(), argv.output, 'public.key'), publicKey, 'ascii')
      writeFileSync(join(cwd(), argv.output, 'private.key'), privateKey, 'ascii')
    } else {
      console.error(err)
    }
  }
)
