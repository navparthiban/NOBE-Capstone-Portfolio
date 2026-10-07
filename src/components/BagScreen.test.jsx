import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RESUME_URL } from '../data/bag.js'
import BagScreen from './BagScreen.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

function stubFetch(response) {
  const fetchMock = vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response)))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const pdf = { ok: true, headers: new Headers({ 'content-type': 'application/pdf' }) }

async function renderBag(cursor = 0, onSelect = vi.fn()) {
  render(<BagScreen cursor={cursor} onKeyDown={() => {}} onSelect={onSelect} />)
  await act(async () => {})
  return onSelect
}

describe('BagScreen links', () => {
  it('links each item to the right place', async () => {
    stubFetch(pdf)
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
    stubFetch(pdf)
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
    stubFetch(pdf)
    await renderBag()
    const link = screen.getByRole('link', { name: /EMAIL/ })
    expect(link).not.toHaveAttribute('target')
    expect(link).not.toHaveTextContent('new tab')
  })

  it('tells the screen which item was clicked', async () => {
    stubFetch(pdf)
    const onSelect = await renderBag()
    fireEvent.click(screen.getByRole('link', { name: /LINKEDIN/ }))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('shows the description of the highlighted item', async () => {
    stubFetch(pdf)
    await renderBag(1)
    expect(screen.getByRole('status')).toHaveTextContent('GitHub')
  })

  it('only the highlighted item is in the Tab order', async () => {
    stubFetch(pdf)
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
    stubFetch(pdf)
    await renderBag(3)
    expect(screen.getByRole('status')).toHaveTextContent('Send Navin an email: navparthiban@gmail.com')
  })

  it('copies the address and says so when EMAIL is clicked', async () => {
    stubFetch(pdf)
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    await renderBag(3)
    fireEvent.click(screen.getByRole('link', { name: /EMAIL/ }))
    await act(async () => {})
    expect(writeText).toHaveBeenCalledWith('navparthiban@gmail.com')
    expect(screen.getByRole('status')).toHaveTextContent('Email address copied!')
  })

  it('keeps showing the address if copying is not allowed', async () => {
    stubFetch(pdf)
    stubClipboard(vi.fn(() => Promise.reject(new Error('denied'))))
    await renderBag(3)
    fireEvent.click(screen.getByRole('link', { name: /EMAIL/ }))
    await act(async () => {})
    expect(screen.getByRole('status')).toHaveTextContent('navparthiban@gmail.com')
    expect(screen.getByRole('status')).not.toHaveTextContent('copied')
  })

  it('does not break when the browser has no clipboard', async () => {
    stubFetch(pdf)
    vi.stubGlobal('navigator', { ...navigator, clipboard: undefined })
    await renderBag(3)
    fireEvent.click(screen.getByRole('link', { name: /EMAIL/ }))
    await act(async () => {})
    expect(screen.getByRole('status')).toHaveTextContent('navparthiban@gmail.com')
  })

  it('does not copy anything for the other items', async () => {
    stubFetch(pdf)
    const writeText = vi.fn(() => Promise.resolve())
    stubClipboard(writeText)
    await renderBag(1)
    fireEvent.click(screen.getByRole('link', { name: /GITHUB/ }))
    expect(writeText).not.toHaveBeenCalled()
  })
})

describe('BagScreen when the resume is missing', () => {
  const message = "Resume isn't available yet."

  it('checks the resume file with a HEAD request', async () => {
    const fetchMock = stubFetch(pdf)
    await renderBag()
    expect(fetchMock).toHaveBeenCalledWith(RESUME_URL, { method: 'HEAD' })
  })

  it('still shows RESUME, but as a message instead of a link, on a 404', async () => {
    stubFetch({ ok: false, headers: new Headers() })
    await renderBag()
    expect(screen.queryByRole('link', { name: /RESUME/ })).not.toBeInTheDocument()
    const item = screen.getByRole('button', { name: /RESUME/ })
    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('status')).toHaveTextContent(message)
  })

  it('treats a page that is not a PDF as missing, like the dev server answers', async () => {
    stubFetch({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) })
    await renderBag()
    expect(screen.queryByRole('link', { name: /RESUME/ })).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(message)
  })

  it('keeps keyboard focus on RESUME when it turns into a message', async () => {
    stubFetch({ ok: false, headers: new Headers() })
    await renderBag()
    expect(screen.getByRole('button', { name: /RESUME/ })).toHaveFocus()
  })

  it('keeps the other items as links', async () => {
    stubFetch({ ok: false, headers: new Headers() })
    await renderBag()
    expect(screen.getAllByRole('link')).toHaveLength(3)
  })

  it('keeps RESUME as a link if the check itself fails, such as being offline', async () => {
    stubFetch(new Error('offline'))
    await renderBag()
    expect(screen.getByRole('link', { name: /RESUME/ })).toHaveAttribute('href', RESUME_URL)
  })
})
