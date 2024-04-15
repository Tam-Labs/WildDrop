import { fastify } from 'fastify'
import database from './plugins/database.js'
import auth from './plugins/auth.js'
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

  // Register request AlephZero plugin for handling incoming requests.
  await app.register(alephZero)

  // Start the server and return the URL where it is listening.
  return await app.listen({ port: Number(process.env.PORT) })
}
