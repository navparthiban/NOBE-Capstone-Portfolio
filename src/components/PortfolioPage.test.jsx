import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RESUME_URL, bagItems } from '../data/bag.js'
import { moves } from '../data/moves.js'
import { party } from '../data/party.js'
import { profile } from '../data/profile.js'
import PortfolioPage from './PortfolioPage.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

const pdf = { ok: true, headers: new Headers({ 'content-type': 'application/pdf' }) }

function stubFetch(response) {
  vi.stubGlobal('fetch', vi.fn(() => (response instanceof Error ? Promise.reject(response) : Promise.resolve(response))))
}

async function renderPage(props = {}) {
  const onBack = props.onBack ?? vi.fn()
  const view = render(<PortfolioPage onBack={onBack} {...props} />)
  await act(async () => {})
  return { onBack, ...view }
}

const card = (title) => screen.getByRole('heading', { level: 3, name: title }).closest('article')

describe('PortfolioPage content', () => {
  it('has the name as the one main heading, with the tagline and the Back to the game button', async () => {
    stubFetch(pdf)
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Navin Parthiban')
    expect(screen.getByText('CS + Chemistry at UIUC')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to the game' })).toBeInTheDocument()
  })

  it('has the four sections as level 2 headings, in order', async () => {
    stubFetch(pdf)
    await renderPage()
    const names = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
    expect(names).toEqual(['About', 'Experience', 'Skills', 'Links and resume'])
    for (const name of names) expect(screen.getByRole('region', { name })).toBeInTheDocument()
  })

  it('shows the about text from the profile data', async () => {
    stubFetch(pdf)
    await renderPage()
    for (const paragraph of profile.about) expect(screen.getByText(paragraph)).toBeInTheDocument()
  })

  it('shows every experience from the party data, with its role, dates, type, and description', async () => {
    stubFetch(pdf)
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(party.length)
    for (const pokemon of party) {
      const element = card(pokemon.experience)
      if (pokemon.type) expect(element.querySelector('.portfolio__type')).toHaveTextContent(pokemon.type)
      if (pokemon.role) expect(element.querySelector('.portfolio__meta')).toHaveTextContent(pokemon.role)
      if (pokemon.dates) expect(element.querySelector('.portfolio__meta')).toHaveTextContent(pokemon.dates)
      if (pokemon.description) expect(within(element).getByText(pokemon.description)).toBeInTheDocument()
    }
  })

  it('shows every skill from the moves data', async () => {
    stubFetch(pdf)
    await renderPage()
    const skills = within(screen.getByRole('region', { name: 'Skills' }))
    expect(skills.getAllByRole('listitem')).toHaveLength(moves.length)
    for (const move of moves) expect(skills.getByText(move.name)).toBeInTheDocument()
  })

  it('shows every link from the bag data, pointing at the right place', async () => {
    stubFetch(pdf)
    await renderPage()
    const links = within(screen.getByRole('region', { name: 'Links and resume' }))
    for (const item of bagItems) {
      const link = links.getByRole('link', { name: new RegExp(item.name) })
      expect(link).toHaveAttribute('href', item.url)
      expect(links.getByText(item.description)).toBeInTheDocument()
    }
  })

  it('opens web links in a new tab safely and says so, but not the email link', async () => {
    stubFetch(pdf)
    await renderPage()
    for (const item of bagItems) {
      const link = screen.getByRole('link', { name: new RegExp(item.name) })
      if (item.external) {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(link).toHaveTextContent('(opens in a new tab)')
      } else {
        expect(link).not.toHaveAttribute('target')
      }
    }
  })

  it('writes the email address out so it can be read even without a mail app', async () => {
    stubFetch(pdf)
    await renderPage()
    expect(screen.getByText('navparthiban@gmail.com')).toBeInTheDocument()
  })
})

describe('PortfolioPage Back to the game', () => {
  it('calls onBack when the button is used', async () => {
    stubFetch(pdf)
    const { onBack } = await renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Back to the game' }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('is the first thing in the tab order and focus starts on the main heading', async () => {
    stubFetch(pdf)
    await renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    const focusable = document.querySelectorAll('a[href], button')
    expect(focusable[0]).toBe(screen.getByRole('button', { name: 'Back to the game' }))
  })
})

describe('PortfolioPage with missing data', () => {
  it('still renders an experience that has none of the optional fields', async () => {
    stubFetch(pdf)
    await renderPage({ experiences: [{ name: 'DITTO', experience: 'Mystery Project' }] })
    const article = within(card('Mystery Project'))
    expect(article.getByRole('heading', { level: 3 })).toBeInTheDocument()
    expect(article.queryByText(/·/)).not.toBeInTheDocument()
    expect(card('Mystery Project').querySelectorAll('p')).toHaveLength(1)
    expect(card('Mystery Project').querySelector('.portfolio__type')).toBeNull()
  })

  it('leaves out only the fields that are missing', async () => {
    stubFetch(pdf)
    await renderPage({
      experiences: [
        { name: 'A', experience: 'Only Role', role: 'Builder' },
        { name: 'B', experience: 'Only Dates', dates: 'Fall 2026' },
        { name: 'C', experience: 'Role And Dates', role: 'Builder', dates: 'Fall 2026', type: 'Club', description: 'Did things.' },
      ],
    })
    expect(within(card('Only Role')).getByText('Builder')).toBeInTheDocument()
    expect(within(card('Only Dates')).getByText('Fall 2026')).toBeInTheDocument()
    const full = within(card('Role And Dates'))
    expect(full.getByText('Builder · Fall 2026')).toBeInTheDocument()
    expect(full.getByText('Club')).toBeInTheDocument()
    expect(full.getByText('Did things.')).toBeInTheDocument()
  })

  it('renders with no experiences, skills, or links at all', async () => {
    stubFetch(pdf)
    await renderPage({ experiences: [], skills: [], links: [] })
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(4)
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows the dates when the party data has them', async () => {
    stubFetch(pdf)
    const dated = party.map((pokemon, i) => (i === 0 ? { ...pokemon, dates: 'Summer 2026' } : pokemon))
    await renderPage({ experiences: dated })
    expect(within(card(party[0].experience)).getByText(`${party[0].role} · Summer 2026`)).toBeInTheDocument()
  })
})

describe('PortfolioPage resume', () => {
  it('links the resume when the PDF exists', async () => {
    stubFetch(pdf)
    await renderPage()
    expect(screen.getByRole('link', { name: /RESUME/ })).toHaveAttribute('href', RESUME_URL)
  })

  it('shows a message instead of a broken link when the PDF is missing', async () => {
    stubFetch({ ok: false, headers: new Headers() })
    await renderPage()
    expect(screen.queryByRole('link', { name: /RESUME/ })).not.toBeInTheDocument()
    expect(screen.getByText("Resume isn't available yet.")).toBeInTheDocument()
    expect(screen.getByText('RESUME')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(bagItems.length - 1)
  })

  it('keeps the resume link if the check itself fails', async () => {
    stubFetch(new Error('offline'))
    await renderPage()
    expect(screen.getByRole('link', { name: /RESUME/ })).toBeInTheDocument()
  })
})

describe('PortfolioPage page settings', () => {
  it('sets the page title and a light page background while it is open, and puts them back after', async () => {
    stubFetch(pdf)
    document.title = 'Navin\'s Portfolio'
    const { unmount } = await renderPage()
    expect(document.title).toBe('Navin Parthiban | Portfolio')
    expect(document.body).toHaveClass('body--light')
    unmount()
    expect(document.title).toBe("Navin's Portfolio")
    expect(document.body).not.toHaveClass('body--light')
  })

  it('scrolls to the top when it opens', async () => {
    stubFetch(pdf)
    const scrollTo = vi.spyOn(window, 'scrollTo')
    await renderPage()
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    scrollTo.mockRestore()
  })
})
