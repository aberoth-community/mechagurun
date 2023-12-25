import { expect, describe, test } from 'vitest'
import { getLocaleResources } from '../util/i18next'
import { join } from 'path'

describe('i18next', () => {
  test('getLocaleResources should return resources', async () => {
    const resource = await getLocaleResources(join(__dirname, '../locales'))
    expect(Object.keys(resource)).toContain('en-US')
  })
})
