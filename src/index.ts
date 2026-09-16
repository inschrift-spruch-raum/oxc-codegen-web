/**
 * Public exports of the library template.
 *
 * @module template
 */

/** Greeting published by the library. */
const GREETING = 'hello world'

/**
 * Return the library greeting.
 *
 * @returns The greeting, as a plain string.
 */
function greet(): string {
  return GREETING
}

export { GREETING, greet }
