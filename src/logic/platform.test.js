import { describe, expect, it } from 'vitest'
import { PLATFORM_HEIGHT, PLATFORM_WIDTH, platformPaths, platformPixels } from './platform.js'

const all = () => Object.entries(platformPixels()).flatMap(([name, list]) => list.map(([x, y]) => ({ name, x, y })))

describe('platform pixel map', () => {
  it('is the same every time', () => {
    expect(platformPixels()).toEqual(platformPixels())
    expect(platformPaths()).toEqual(platformPaths())
  })

  it('uses all four shades and builds a path for each', () => {
    const paths = platformPaths()
    for (const name of ['rim', 'dark', 'mid', 'light']) {
      expect(paths[name].length).toBeGreaterThan(0)
    }
  })

  it('keeps every pixel inside the grid', () => {
    for (const { x, y } of all()) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(PLATFORM_WIDTH)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThan(PLATFORM_HEIGHT)
    }
  })

  it('never puts a pixel in two shades', () => {
    const keys = all().map(({ x, y }) => `${x},${y}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('has tufts above the top of the oval', () => {
    const topRow = Math.min(...all().filter(({ name }) => name === 'light').map(({ y }) => y))
    expect(all().some(({ y }) => y < topRow)).toBe(true)
  })

  it('only puts the rim in the lower half', () => {
    const rim = all().filter(({ name }) => name === 'rim')
    expect(rim.length).toBeGreaterThan(0)
    for (const { y } of rim) expect(y).toBeGreaterThanOrEqual(PLATFORM_HEIGHT / 2)
  })
})
