import { OptionalProps, Property } from '@mikro-orm/postgresql'

/**
 * Represents a base model for entities with createdAt and updatedAt properties.
 * @abstract
 * @class
 */
export abstract class Model {
  /**
   * Specifies optional properties for the model.
   */
  [OptionalProps]?: 'createdAt' | 'updatedAt'

  /**
   * Creation timestamp of the entity.
   * @type {Date}
   */
  @Property()
  createdAt = new Date()

  /**
   * Last updated timestamp of the entity.
   * @type {Date}
   */
  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date()
}
