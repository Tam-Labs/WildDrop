export type Environment = 'development' | 'production' | 'testing'

const s2b = (s?: string) => ['1', 'true'].includes(s?.toLowerCase())

export const PORT = Number(process.env.PORT) || 9876

export const DB_HOST = process.env.DB_HOST ?? 'localhost'
export const DB_NAME = process.env.DB_NAME ?? 'WildDrop'
export const DB_USER = process.env.DB_USER ?? 'WildDrop'
export const DB_PASS = process.env.DB_PASS ?? 'WildDrop'
export const DB_DEBUG = s2b(process.env.DB_PASS)

export const SESSION_EXPIRE = Number(process.env.SESSION_EXPIRE) || 60

export const AZ_CONTRACT = process.env.AZ_CONTRACT // Contract address.
export const AZ_ACCOUNT = process.env.AZ_ACCOUNT // Account JSON file encoded as base64.
export const AZ_ACCOUNT_PATH = process.env.AZ_ACCOUNT_PATH // Used when AC_ACCOUNT is empty.
export const AZ_METADATA = process.env.AZ_METADATA // Metadata JSON file encoded as base64.
export const AZ_METADATA_PATH = process.env.AZ_METADATA_PATH
export const AZ_URL = process.env.AZ_URL
export const AZ_PASSPHRASE =
  Buffer.from(process.env.AZ_PASSPHRASE, 'base64').toString('base64') === process.env.AZ_PASSPHRASE
    ? Buffer.from(process.env.AZ_PASSPHRASE, 'base64').toString('ascii')
    : process.env.AZ_PASSPHRASE

export const NODE_ENV: Environment = process.env.NODE_ENV as Environment
