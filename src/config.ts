export type Environment = 'development' | 'production' | 'testing'

const s2b = (s?: string) => ['1', 'true'].includes(s?.toLowerCase())

export const SERVER_PORT = Number(process.env.SERVER_PORT) || 9876

export const DB_HOST = process.env.DB_HOST ?? 'localhost'
export const DB_NAME = process.env.DB_NAME ?? 'WildDrop'
export const DB_USER = process.env.DB_USER ?? 'WildDrop'
export const DB_PASS = process.env.DB_PASS ?? 'WildDrop'
export const DB_DEBUG = s2b(process.env.DB_PASS)

export const SESSION_EXPIRE = Number(process.env.SESSION_EXPIRE) || 60

export const AZ_CONTRACT = process.env.AZ_CONTRACT
export const AZ_ACCOUNT_PATH = process.env.AZ_ACCOUNT_PATH
export const AZ_METADATA_PATH = process.env.AZ_METADATA_PATH
export const AZ_URL = process.env.AZ_URL
export const AZ_PASSPHRASE = process.env.AZ_PASSPHRASE

export const NODE_ENV: Environment = process.env.NODE_ENV as Environment
