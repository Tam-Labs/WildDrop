/**
 * This module provides a Fastify plugin for connecting to a PostgreSQL database using MikroORM.
 * It initializes the database connection, runs migrations, and sets up request hooks for managing the database context.
 * @module DatabasePlugin
 */
import { MikroORM, RequestContext } from '@mikro-orm/postgresql'
import { FastifyPluginAsync } from 'fastify'
import { NODE_ENV } from '../config.js'
import fp from 'fastify-plugin'
import config from '../mikro-orm.config.js'

/**
 * Extends the FastifyRequest interface to include the ORM instance.
 */
declare module 'fastify' {
  interface FastifyRequest {
    orm: MikroORM
  }
}

/**
 * Initializes the database connection using MikroORM and sets up hooks for handling requests and closing connections.
 * @function database
 * @param {FastifyInstance} fastify - Fastify instance.
 * @returns {Promise<void>} Promise resolving once the database connection is established and hooks are set.
 */
const database: FastifyPluginAsync = async (fastify) => {
  // Initialize MikroORM with the PostgreSQL driver and provided configuration.
  const orm = await MikroORM.init(config)

  // Generate new migration if needed.
  if (NODE_ENV === 'development') {
    await orm.migrator.createMigration()
  }

  // Run pending database migrations.
  await orm.migrator.up()

  // Set up hook to attach ORM instance to each incoming request and manage RequestContext.
  fastify.addHook('onRequest', (request, _, done) => {
    // Decorate FastifyRequest with ORM instance.
    request.orm = orm

    // Create RequestContext for the current request's EntityManager.
    RequestContext.create(orm.em, done)
  })

  // Set up hook to close the database connection when Fastify server closes.
  fastify.addHook('onClose', async () => {
    await orm.close()
  })
}

// Export the Fastify plugin wrapped with fastify-plugin for compatibility.
export default fp(database)
