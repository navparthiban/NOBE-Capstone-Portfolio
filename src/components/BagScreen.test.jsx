import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RESUME_URL } from '../data/bag.js'
import BagScreen from './BagScreen.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

async function renderBag(cursor = 0, onSelect = vi.fn()) {
  render(<BagScreen cursor={cursor} onKeyDown={() => {}} onSelect={onSelect} />)
  await act(async () => {})
  return onSelect
}

describe('BagScreen links', () => {
  it('links each item to the right place', async () => {
    await renderBag()
    expect(screen.getByRole('link', { name: /RESUME/ })).toHaveAttribute('href', RESUME_URL)
    expect(screen.getByRole('link', { name: /GITHUB/ })).toHaveAttribute('href', 'https://github.com/navparthiban')
    expect(screen.getByRole('link', { name: /LINKEDIN/ })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/navin-parthiban',
    )
    expect(screen.getByRole('link', { name: /EMAIL/ })).toHaveAttribute('href', 'mailto:navparthiban@gmail.com')
  })

  it('opens web links in a new tab safely and says so', async () => {
    await renderBag()
    for (const name of [/RESUME/, /GITHUB/, /LINKEDIN/]) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link.getAttribute('rel')).toContain('noopener')
      expect(link.getAttribute('rel')).toContain('noreferrer')
      expect(link).toHaveTextContent('(opens in a new tab)')
    }
  })

  it('opens the email link in the same tab', async () => {
    await renderBag()
    const link = screen.getByRole('link', { name: /EMAIL/ })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveTextContent('new tab')
  })

  it('tells the screen which item was clicked', async () => {
    const onSelect = await renderBag()
    fireEvent.click(screen.getByRole('link', { name: /LINKEDIN/ }))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('shows the description of the highlighted item', async () => {
    await renderBag(1)
    expect(screen.getByRole('status')).toHaveTextContent('GitHub')
  })

  it('only the highlighted item is in the Tab order', async () => {
    await renderBag(2)
    expect(screen.getByRole('link', { name: /LINKEDIN/ })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('link', { name: /GITHUB/ })).toHaveAttribute('tabindex', '-1')
  })
})

describe('BagScreen email', () => {
  function stubClipboard(writeText) {
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
  }

  it('shows the email address in the description', async () => {
    await renderBag(3)
    expect(screen.getByRole('status')).toHaveTextContent('Send Navin an email: navparthiban@gmail.com')
  })

  it('copies the address and says so when EMAIL is clicked', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    await renderBag(3)
    fireEvent.click(screen.getByRole('link', { name: /EMAIL/ }))
    await act(async () => {})
    expect(writeText).toHaveBeenCalledWith('navparthiban@gmail.com')
    expect(screen.getByRole('status')).toHaveTextContent('Email address copied!')
  })

  it('keeps showing the address if copying is not allowed', async () => {
    stubClipboard(vi.fn(() => Promise.reject(new Error('denied'))))
    await renderBag(3)
    fireEvent.click(screen.getByRole('link', { name: /EMAIL/ }))
    await act(async () => {})
    expect(screen.getByRole('status')).toHaveTextContent('navparthiban@gmail.com')
    expect(screen.getByRole('status')).not.toHaveTextContent('copied')
  })

  it('does not break when the browser has no clipboard', async () => {
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    await renderBag(3)
    fireEvent.click(screen.getByRole('link', { name: /EMAIL/ }))
    await act(async () => {})
    expect(screen.getByRole('status')).toHaveTextContent('navparthiban@gmail.com')
  })

  it('does not copy anything for the other items', async () => {
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    await renderBag(1)
    fireEvent.click(screen.getByRole('link', { name: /GITHUB/ }))
    expect(writeText).not.toHaveBeenCalled()
  })
})

describe('BagScreen resume', () => {
  it('is a link to the Drive file on first render, focused when highlighted, with no network check', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await renderBag()
    const link = screen.getByRole('link', { name: /RESUME/ })
    expect(link).toHaveAttribute('href', RESUME_URL)
    expect(link).toHaveFocus()
    expect(screen.queryByRole('button', { name: /RESUME/ })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Google Drive')
    expect(screen.getAllByRole('link')).toHaveLength(4)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
