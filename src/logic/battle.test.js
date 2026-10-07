import { describe, expect, it } from 'vitest'
import { getHpPercent, getMenuOptions, getSelectionMessage, moveCursor } from './battle.js'

describe('getMenuOptions', () => {
  it('returns the four battle menu options in order', () => {
    expect(getMenuOptions()).toEqual(['FIGHT', 'BAG', 'PARTY', 'RUN'])
  })
})

describe('moveCursor', () => {
  it('moves right and down through the 2x2 grid', () => {
    expect(moveCursor(0, 'ArrowRight')).toBe(1)
    expect(moveCursor(0, 'ArrowDown')).toBe(2)
    expect(moveCursor(1, 'ArrowDown')).toBe(3)
  })

  it('moves left and up through the 2x2 grid', () => {
    expect(moveCursor(3, 'ArrowLeft')).toBe(2)
    expect(moveCursor(3, 'ArrowUp')).toBe(1)
    expect(moveCursor(2, 'ArrowUp')).toBe(0)
  })

  it('stays put at the edges instead of wrapping', () => {
    expect(moveCursor(0, 'ArrowUp')).toBe(0)
    expect(moveCursor(0, 'ArrowLeft')).toBe(0)
    expect(moveCursor(1, 'ArrowRight')).toBe(1)
    expect(moveCursor(1, 'ArrowUp')).toBe(1)
    expect(moveCursor(2, 'ArrowLeft')).toBe(2)
    expect(moveCursor(2, 'ArrowDown')).toBe(2)
    expect(moveCursor(3, 'ArrowRight')).toBe(3)
    expect(moveCursor(3, 'ArrowDown')).toBe(3)
  })

  it('ignores keys that are not arrows', () => {
    expect(moveCursor(1, 'a')).toBe(1)
    expect(moveCursor(2, 'Enter')).toBe(2)
  })

  it('does not move onto a missing option in an uneven grid', () => {
    expect(moveCursor(2, 'ArrowRight', 3)).toBe(2)
    expect(moveCursor(1, 'ArrowDown', 3)).toBe(1)
  })
})

describe('getSelectionMessage', () => {
  it('shows the message for each option', () => {
    expect(getSelectionMessage('FIGHT')).toBe('Navin wants to FIGHT!')
    expect(getSelectionMessage('RUN')).toBe('Navin wants to RUN!')
  })
})

describe('getHpPercent', () => {
  it('returns the percent of HP left', () => {
    expect(getHpPercent(30, 60)).toBe(50)
  })

  it('clamps below 0 and above max', () => {
    expect(getHpPercent(-5, 60)).toBe(0)
    expect(getHpPercent(90, 60)).toBe(100)
  })

  it('returns 0 when max HP is 0', () => {
    expect(getHpPercent(10, 0)).toBe(0)
  })
})
