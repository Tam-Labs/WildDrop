import { fastify } from 'fastify'
import { SERVER_PORT } from './config.js'
import database from './plugins/database.js'
import auth from './plugins/auth.js'
import wallet from './plugins/wallet.js'
import alephZero from './plugins/aleph-zero.js'

/**
 * Bootstraps the application by initializing necessary configurations and dependencies.
 * @function bootstrap
 * @returns {Promise<string>} A promise that resolves to the URL where the server is started.
 */
export async function bootstrap() {
  // Initialize Fastify application.
  const app = fastify()

  // Register database plugin to establish connection with the database.
  await app.register(database)

  // Register request auth plugin for handling incoming requests.
  await app.register(auth)

  await app.register(wallet)

  // Register request AlephZero plugin for handling incoming requests.
  await app.register(alephZero)

  // Start the server and return the URL where it is listening.
  return await app.listen({ port: SERVER_PORT })
}
