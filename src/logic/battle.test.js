import { describe, expect, it } from 'vitest'
import { getMenuOptions } from './battle.js'

describe('getMenuOptions', () => {
  it('returns the four battle menu options in order', () => {
    expect(getMenuOptions()).toEqual(['FIGHT', 'BAG', 'PARTY', 'RUN'])
  })
})
