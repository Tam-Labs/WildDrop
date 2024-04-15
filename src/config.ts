export type Environment = 'development' | 'production' | 'testing'

export const SERVER_PORT = Number(process.env.SERVER_PORT) || 9876

export const DB_HOST = process.env.DB_HOST ?? 'localhost'
export const DB_NAME = process.env.DB_NAME ?? 'WildDrop'
export const DB_USER = process.env.DB_USER ?? 'WildDrop'
export const DB_PASS = process.env.DB_PASS ?? 'WildDrop'

export const REDIS_HOST = process.env.REDIS_HOST ?? 'localhost'

export const JWT_PASSPHRASE = process.env.JWT_PASSPHRASE ?? 'passphrase'
export const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY ?? 'sec/private.key'
export const JWT_PUBLIC_KEY = process.env.JWT_PUBLIC_KEY ?? 'sec/public.key'
export const JWT_EXPIRE = process.env.JWT_EXPIRE ?? '60s'

export const AZ_CONTRACT = process.env.AZ_CONTRACT
export const AZ_ACCOUNT_PATH = process.env.AZ_ACCOUNT_PATH
export const AZ_METADATA_PATH = process.env.AZ_METADATA_PATH
export const AZ_URL = process.env.AZ_URL

export const NODE_ENV: Environment = process.env.NODE_ENV as Environment
