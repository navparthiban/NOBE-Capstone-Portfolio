import { describe, expect, it } from 'vitest'
import { bagItems } from '../data/bag.js'
import {
  BACKPACK_ROWS,
  BACKPACK_SIZE,
  BAG_ART_COLORS,
  BAG_ICON_ROWS,
  ICON_SIZE,
  artPaths,
  artPixels,
} from './bagArt.js'

function expectKnownSquareGrid(rows, size) {
  expect(rows).toHaveLength(size)
  for (const row of rows) {
    expect(row).toHaveLength(size)
    for (const char of row) expect(char === '.' || BAG_ART_COLORS[char]).toBeTruthy()
  }
}

describe('bag art', () => {
  it('draws the backpack on a square grid that only uses known characters', () => {
    expectKnownSquareGrid(BACKPACK_ROWS, BACKPACK_SIZE)
  })

  it('draws every icon on a square grid that only uses known characters', () => {
    for (const rows of Object.values(BAG_ICON_ROWS)) expectKnownSquareGrid(rows, ICON_SIZE)
  })

  it('has an icon for every bag item', () => {
    for (const item of bagItems) expect(BAG_ICON_ROWS[item.icon]).toBeDefined()
  })

  it('draws every icon with something in it', () => {
    for (const rows of Object.values(BAG_ICON_ROWS)) expect(Object.keys(artPixels(rows)).length).toBeGreaterThan(0)
  })

  it('never uses the same pixel twice', () => {
    for (const rows of [BACKPACK_ROWS, ...Object.values(BAG_ICON_ROWS)]) {
      const all = Object.values(artPixels(rows)).flat().map(([x, y]) => `${x},${y}`)
      expect(new Set(all).size).toBe(all.length)
    }
  })

  it('makes one path per colour, built from whole one-pixel squares', () => {
    const paths = artPaths(BACKPACK_ROWS)
    expect(Object.keys(paths)).toEqual(Object.keys(artPixels(BACKPACK_ROWS)))
    for (const d of Object.values(paths)) expect(d).toMatch(/^(M\d+ \d+h1v1h-1z)+$/)
  })

  it('has a backpack that is the same on the left and the right', () => {
    for (const row of BACKPACK_ROWS) {
      const filled = [...row].map((char) => char !== '.')
      expect(filled).toEqual([...filled].reverse())
    }
  })
})
