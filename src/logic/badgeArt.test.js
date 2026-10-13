import { describe, expect, it } from 'vitest'
import {
  BADGE_COLORS,
  BADGE_ROWS,
  BADGE_SIZE,
  SHINE_END,
  SHINE_START,
  badgePaths,
  badgePixels,
  shinePixels,
} from './badgeArt.js'

describe('badge art', () => {
  it('is a square grid that only uses known characters', () => {
    expect(BADGE_ROWS).toHaveLength(BADGE_SIZE)
    for (const row of BADGE_ROWS) {
      expect(row).toHaveLength(BADGE_SIZE)
      for (const char of row) expect(char === '.' || BADGE_COLORS[char]).toBeTruthy()
    }
  })

  it('has a silhouette that is the same on the left and the right', () => {
    for (const row of BADGE_ROWS) {
      const filled = [...row].map((char) => char !== '.')
      expect(filled).toEqual([...filled].reverse())
    }
  })

  it('builds a path for every colour and for the silhouette', () => {
    const paths = badgePaths()
    for (const name of [...Object.values(BADGE_COLORS), 'silhouette']) {
      expect(paths[name].length).toBeGreaterThan(0)
    }
  })

  it('draws the brackets, the flask glass, and the liquid', () => {
    const pixels = badgePixels()
    expect(pixels.bracket.length).toBeGreaterThan(0)
    expect(pixels.glass.length).toBeGreaterThan(0)
    expect(pixels.liquid.length).toBeGreaterThan(0)
  })

  it('puts the < on the left half and the > on the right half', () => {
    const { bracket } = badgePixels()
    expect(bracket.filter(([x]) => x < BADGE_SIZE / 2)).toHaveLength(bracket.length / 2)
  })

  it('never uses a pixel twice', () => {
    const keys = Object.values(badgePixels()).flatMap((list) => list.map(([x, y]) => `${x},${y}`))
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('sweeps the shine from fully left of the badge to fully right of it', () => {
    const shine = shinePixels()
    expect(shine.every(([, y]) => y >= 0 && y < BADGE_SIZE)).toBe(true)
    expect(Math.max(...shine.map(([x]) => x + SHINE_START))).toBeLessThan(0)
    expect(Math.min(...shine.map(([x]) => x + SHINE_END))).toBeGreaterThanOrEqual(BADGE_SIZE)
  })
})
