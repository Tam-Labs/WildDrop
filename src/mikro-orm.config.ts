import { defineConfig } from '@mikro-orm/postgresql'
import { Migrator } from '@mikro-orm/migrations'
import { SqlHighlighter } from '@mikro-orm/sql-highlighter'
import { Wallet } from './models/wallet.js'
import { cwd } from 'node:process'
import { join } from 'node:path'
import { DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_DEBUG } from './config.js'
import { AuthKey } from './models/auth-key.js'
import { Session } from './models/session.js'

export default defineConfig({
  host: DB_HOST,
  dbName: DB_NAME,
  user: DB_USER,
  password: DB_PASS,
  entities: [Wallet, AuthKey, Session],
  entitiesTs: [Wallet, AuthKey, Session],
  debug: DB_DEBUG,
  highlighter: new SqlHighlighter(),
  extensions: [Migrator],
  schemaGenerator: {
    disableForeignKeys: false,
  },
  migrations: {
    path: join(cwd(), 'dist/migrations'),
    pathTs: join(cwd(), 'src/migrations'),
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
    disableForeignKeys: false,
  },
})
