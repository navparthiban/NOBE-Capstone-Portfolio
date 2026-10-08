import { describe, expect, it } from 'vitest'
import { bagItems } from '../data/bag.js'
import { getLinkProps } from './links.js'

describe('getLinkProps', () => {
  it('opens external links in a new tab, safely', () => {
    expect(getLinkProps({ url: 'https://example.com', external: true })).toEqual({
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer',
    })
  })

  it('leaves target and rel off for links that stay in the same tab', () => {
    expect(getLinkProps({ url: 'mailto:a@b.c', external: false })).toEqual({ href: 'mailto:a@b.c' })
  })

  it('treats a missing external flag as the same tab', () => {
    expect(getLinkProps({ url: '/x' })).toEqual({ href: '/x' })
  })

  it('gives the bag items the right properties', () => {
    const props = Object.fromEntries(bagItems.map((item) => [item.name, getLinkProps(item)]))
    expect(props.GITHUB.target).toBe('_blank')
    expect(props.LINKEDIN.rel).toBe('noopener noreferrer')
    expect(props.EMAIL.target).toBeUndefined()
    expect(props.RESUME.href).toBe(bagItems[0].url)
  })
})
