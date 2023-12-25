import { expect, describe, test } from 'vitest'
import { assert } from '../util/assert'

describe('assert', () => {
  test('assert should throw', () => {
    expect(() => {
      assert(null, 'testing')
    }).toThrowError(/testing/)
  })

  test('assert should return input', () => {
    expect(assert(12, 'testing')).toBe(12)
  })
})
