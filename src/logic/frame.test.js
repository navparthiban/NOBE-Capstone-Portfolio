import { describe, expect, it } from 'vitest'
import { computeFrame } from './frame.js'

const viewports = [
  [1920, 1080],
  [1366, 768],
  [2560, 1440],
  [1024, 1024],
  [844, 390],
  [390, 844],
  [375, 667],
  [360, 800],
  [768, 1024],
  [500, 300],
]
const pixelRatios = [1, 1.25, 1.5, 2, 3]

describe('computeFrame', () => {
  it('fills the height on a wide desktop window', () => {
    expect(computeFrame({ width: 1920, height: 1080 })).toMatchObject({
      orientation: 'landscape',
      width: 1440,
      height: 1080,
    })
  })

  it('is limited by the width when the window is not wide enough', () => {
    const frame = computeFrame({ width: 800, height: 700 })
    expect(frame.orientation).toBe('landscape')
    expect(frame.width).toBe(800)
    expect(frame.height).toBe(600)
  })

  it('uses the full width of a phone held upright', () => {
    const frame = computeFrame({ width: 390, height: 844, dpr: 3 })
    expect(frame.orientation).toBe('portrait')
    expect(frame.width).toBe(390)
    expect(frame.height).toBe(520)
  })

  it('is limited by the height on a nearly square, slightly tall window', () => {
    const frame = computeFrame({ width: 900, height: 1000 })
    expect(frame.orientation).toBe('portrait')
    expect(frame.width).toBe(750)
    expect(frame.height).toBe(1000)
  })

  it('treats a phone held sideways as landscape', () => {
    const frame = computeFrame({ width: 844, height: 390, dpr: 3 })
    expect(frame.orientation).toBe('landscape')
    expect(frame.height).toBeLessThanOrEqual(390)
  })

  it('treats a square window as landscape', () => {
    expect(computeFrame({ width: 800, height: 800 }).orientation).toBe('landscape')
  })

  it('always fits inside the window and keeps the aspect ratio', () => {
    for (const [width, height] of viewports) {
      for (const dpr of pixelRatios) {
        const frame = computeFrame({ width, height, dpr })
        const ratio = frame.orientation === 'portrait' ? 3 / 4 : 4 / 3
        expect(frame.width).toBeLessThanOrEqual(width)
        expect(frame.height).toBeLessThanOrEqual(height)
        expect(frame.width / frame.height).toBeCloseTo(ratio, 10)
      }
    }
  })

  it('sizes the frame in whole device pixels', () => {
    for (const [width, height] of viewports) {
      for (const dpr of pixelRatios) {
        const frame = computeFrame({ width, height, dpr })
        expect(Number.isInteger(Math.round(frame.width * dpr * 1e6) / 1e6)).toBe(true)
        expect(Number.isInteger(Math.round(frame.height * dpr * 1e6) / 1e6)).toBe(true)
      }
    }
  })

  it('picks a font size that is a multiple of 8 device pixels', () => {
    for (const [width, height] of viewports) {
      for (const dpr of pixelRatios) {
        const { fontSize } = computeFrame({ width, height, dpr })
        const devicePixels = Math.round(fontSize * dpr * 1e6) / 1e6
        expect(devicePixels % 8).toBe(0)
        expect(devicePixels).toBeGreaterThanOrEqual(8)
      }
    }
  })

  it('picks a font size that lets the whole layout fit across the frame', () => {
    for (const [width, height] of viewports) {
      for (const dpr of pixelRatios) {
        const frame = computeFrame({ width, height, dpr })
        const ems = frame.orientation === 'portrait' ? 30 : 40
        if (frame.width * dpr >= ems * 8) {
          expect(frame.fontSize * ems).toBeLessThanOrEqual(frame.width + 1e-9)
        }
      }
    }
  })

  it('makes the font bigger when the frame is bigger', () => {
    const small = computeFrame({ width: 800, height: 600 })
    const large = computeFrame({ width: 1920, height: 1080 })
    expect(large.fontSize).toBeGreaterThan(small.fontSize)
  })

  it('does not break with a tiny, empty, or negative window', () => {
    for (const size of [
      { width: 0, height: 0 },
      { width: 100, height: 50 },
      { width: -10, height: 500 },
      { width: 500, height: -10 },
    ]) {
      const frame = computeFrame(size)
      expect(frame.width).toBeGreaterThanOrEqual(0)
      expect(frame.height).toBeGreaterThanOrEqual(0)
      expect(frame.fontSize).toBeGreaterThanOrEqual(8)
      expect(Number.isFinite(frame.width + frame.height + frame.fontSize)).toBe(true)
    }
  })

  it('falls back to a pixel ratio of 1 when it is missing or invalid', () => {
    const expected = computeFrame({ width: 1000, height: 700, dpr: 1 })
    expect(computeFrame({ width: 1000, height: 700 })).toEqual(expected)
    expect(computeFrame({ width: 1000, height: 700, dpr: 0 })).toEqual(expected)
    expect(computeFrame({ width: 1000, height: 700, dpr: -2 })).toEqual(expected)
  })
})
