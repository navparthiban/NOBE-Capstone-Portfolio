import { describe, expect, it } from 'vitest'
import { RESUME_URL, bagItems } from './bag.js'

const byName = (name) => bagItems.find((item) => item.name === name)

describe('bag data', () => {
  it('has the four items with unique names and descriptions', () => {
    expect(bagItems.map((item) => item.name)).toEqual(['RESUME', 'GITHUB', 'LINKEDIN', 'EMAIL'])
    expect(new Set(bagItems.map((item) => item.name)).size).toBe(4)
    for (const item of bagItems) expect(item.description.length).toBeGreaterThan(0)
  })

  it('links each item to the right place', () => {
    expect(byName('RESUME').url).toBe(RESUME_URL)
    expect(RESUME_URL.endsWith('resume.pdf')).toBe(true)
    expect(byName('GITHUB').url).toBe('https://github.com/navparthiban')
    expect(byName('LINKEDIN').url).toBe('https://www.linkedin.com/in/navin-parthiban')
    expect(byName('EMAIL').url).toBe('mailto:navparthiban@gmail.com')
  })

  it('opens web links in a new tab but not the email link', () => {
    expect(bagItems.filter((item) => item.external).map((item) => item.name)).toEqual([
      'RESUME',
      'GITHUB',
      'LINKEDIN',
    ])
  })

  it('has a message for when the resume is missing', () => {
    expect(byName('RESUME').missingMessage).toMatch(/resume/i)
  })
})
