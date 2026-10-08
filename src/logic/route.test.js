import { describe, expect, it } from 'vitest'
import { PORTFOLIO_HASH, getViewFromHash } from './route.js'

describe('getViewFromHash', () => {
  it('opens the portfolio for #portfolio', () => {
    expect(getViewFromHash('#portfolio')).toBe('portfolio')
    expect(PORTFOLIO_HASH).toBe('#portfolio')
  })

  it('shows the game for no hash, an empty hash, or any other hash', () => {
    for (const hash of ['', '#', '#about', '#Portfolio', '#portfolio/extra', 'portfolio', undefined, null]) {
      expect(getViewFromHash(hash)).toBe('game')
    }
  })
})
