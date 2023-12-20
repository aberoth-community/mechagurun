/**
 * Base embed
 * @class
 */
export default abstract class BaseEmbed {
  readonly name: string

  constructor(name: string) {
    this.name = name
  }
}
