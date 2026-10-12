import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BadgeArt from './BadgeArt.jsx'

describe('BadgeArt', () => {
  it('is an image named Portfolio Badge by default', () => {
    render(<BadgeArt />)
    expect(screen.getByRole('img', { name: 'Portfolio Badge' })).toBeInTheDocument()
  })

  it('takes a different label and a class', () => {
    render(<BadgeArt label="Badge" className="extra" />)
    expect(screen.getByRole('img', { name: 'Badge' })).toHaveClass('badge-art', 'extra')
  })

  it('gives two badges on one page different clip ids', () => {
    const { container } = render(
      <>
        <BadgeArt />
        <BadgeArt />
      </>,
    )
    const ids = [...container.querySelectorAll('clipPath')].map((clip) => clip.id)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
  })
})
