import { describe, expect, it } from 'vitest'
import { MAX_LINE_LENGTH } from '../logic/intro.js'
import { badge, badgeLines } from './badge.js'

describe('badge data', () => {
  it('has a name and a prompt', () => {
    expect(badge.name).toBeTruthy()
    expect(badge.prompt).toBeTruthy()
  })

  it('has badge lines with no stray spaces and none too long for the text box', () => {
    expect(badgeLines.length).toBeGreaterThan(0)
    for (const line of [...badgeLines, badge.prompt]) {
      expect(line).toBe(line.trim())
      expect(line.length).toBeGreaterThan(0)
      expect(line.length).toBeLessThanOrEqual(MAX_LINE_LENGTH)
    }
  })
})
