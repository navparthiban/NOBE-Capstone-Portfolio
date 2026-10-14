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
    expect(RESUME_URL).toBe('https://drive.google.com/file/d/1vuss1LDWPIp0UDzajf2gXJdhKR7cN1RY/view?usp=sharing')
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

  it('has no missing-file message, since the resume is not a local file', () => {
    for (const item of bagItems) expect(item.missingMessage).toBeUndefined()
  })
})
