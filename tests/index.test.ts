import { describe, expect, it } from 'vitest'

import { GREETING, greet } from '#src/index'

const TEST_TIMEOUT = 5000

function testGreetsTheWorld(): void {
  expect.hasAssertions()
  expect(greet()).toBe('hello world')
}

function testExportsTheGreeting(): void {
  expect.hasAssertions()
  expect(GREETING).toBe('hello world')
}

describe('template', () => {
  it('greets the world', { timeout: TEST_TIMEOUT }, testGreetsTheWorld)

  it('exports the greeting', { timeout: TEST_TIMEOUT }, testExportsTheGreeting)
})
