import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { introLines } from './data/intro.js'

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('fetch', () => new Promise(() => {}))
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

function tick(ms) {
  for (let elapsed = 0; elapsed < ms; elapsed += 25) {
    act(() => vi.advanceTimersByTime(25))
  }
}

function nextMessage() {
  tick(4000)
  fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
}

const status = () => screen.getByRole('status')
const inBattle = () => screen.queryByRole('button', { name: 'SKIP' }) === null

describe('App', () => {
  it('opens on the Professor intro, not the battle', () => {
    render(<App />)
    expect(status()).toHaveTextContent(introLines[0])
    expect(screen.getByRole('button', { name: 'SKIP' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'FIGHT' })).not.toBeInTheDocument()
  })

  it('ends on the battle after advancing through every line', () => {
    render(<App />)
    for (let line = 0; line < introLines.length; line++) {
      expect(status()).toHaveTextContent(introLines[line])
      expect(inBattle()).toBe(false)
      nextMessage()
    }
    expect(inBattle()).toBe(true)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('goes straight to the battle with SKIP', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
    expect(inBattle()).toBe(true)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('goes straight to the battle with Escape', () => {
    render(<App />)
    nextMessage()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(inBattle()).toBe(true)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('lets SKIP work from the last line too', () => {
    render(<App />)
    for (let line = 0; line < introLines.length - 1; line++) nextMessage()
    expect(status()).toHaveTextContent('Good luck!')
    fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('plays the battle normally after the intro, and Escape in the battle is harmless', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
    nextMessage()
    nextMessage()
    nextMessage()
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'FIGHT' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SKIP' })).not.toBeInTheDocument()
  })
})

function startBattle() {
  fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
  nextMessage()
  nextMessage()
  nextMessage()
}

const clickOption = (name) => fireEvent.click(screen.getByRole('button', { name }))
const hasMenu = () => screen.queryByRole('group', { name: 'Battle menu' }) !== null
const portfolioHeading = () => screen.queryByRole('heading', { level: 1, name: 'Navin Parthiban' })
const goToHash = (hash) => {
  window.history.pushState(null, '', `/${hash}`)
  fireEvent(window, new PopStateEvent('popstate'))
}

describe('App RUN and the plain portfolio', () => {
  it('opens the portfolio only after the "Got away safely!" message is dismissed', () => {
    render(<App />)
    startBattle()
    clickOption('RUN')
    expect(status()).toHaveTextContent('Got away safely!')
    expect(portfolioHeading()).not.toBeInTheDocument()
    expect(window.location.hash).toBe('')
    nextMessage()
    expect(portfolioHeading()).toBeInTheDocument()
    expect(window.location.hash).toBe('#portfolio')
  })

  it('hides the game from the page and from assistive tech while the portfolio is open', () => {
    const { container } = render(<App />)
    startBattle()
    clickOption('RUN')
    nextMessage()
    const stage = container.querySelector('.stage')
    expect(stage).toHaveAttribute('aria-hidden', 'true')
    expect(stage).toHaveAttribute('inert')
    expect(stage).toHaveClass('stage--away')
    expect(screen.queryByRole('button', { name: 'FIGHT' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back to the game' })).toBeInTheDocument()
  })

  it('goes back to the battle exactly as it was, with the same HP and the same Pokémon out', () => {
    const { container } = render(<App />)
    startBattle()
    clickOption('FIGHT')
    clickOption('React')
    while (!hasMenu()) nextMessage()
    clickOption('PARTY')
    clickOption(/^ALAKAZAM/)
    clickOption('SWITCH')
    while (!hasMenu()) nextMessage()

    const playerStatus = () => container.querySelector('.status--player').textContent
    const bar = (name) => screen.getByRole('progressbar', { name: `${name} HP` })
    const sprites = [container.querySelector('.sprite--player'), container.querySelector('.sprite--opponent')]
    expect(playerStatus()).toContain('ALAKAZAM')
    expect(playerStatus()).toContain('45/55')
    expect(bar('SCREENMON')).toHaveAttribute('aria-valuenow', '20')

    clickOption('RUN')
    nextMessage()
    expect(portfolioHeading()).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Back to the game' }))
    tick(100)

    expect(portfolioHeading()).not.toBeInTheDocument()
    expect(hasMenu()).toBe(true)
    expect(status()).toHaveTextContent('What will ALAKAZAM do?')
    expect(playerStatus()).toContain('ALAKAZAM')
    expect(playerStatus()).toContain('45/55')
    expect(bar('SCREENMON')).toHaveAttribute('aria-valuenow', '20')
    expect(container.querySelector('.sprite--player')).toBe(sprites[0])
    expect(container.querySelector('.sprite--opponent')).toBe(sprites[1])
    expect(container.querySelector('.stage')).not.toHaveClass('stage--away')
    expect(window.location.hash).toBe('')
  })

  it('puts keyboard focus back on RUN after returning', () => {
    render(<App />)
    startBattle()
    clickOption('RUN')
    nextMessage()
    fireEvent.click(screen.getByRole('button', { name: 'Back to the game' }))
    tick(100)
    expect(screen.getByRole('button', { name: 'RUN' })).toHaveFocus()
  })

  it('can run again after coming back', () => {
    render(<App />)
    startBattle()
    for (let round = 0; round < 2; round++) {
      clickOption('RUN')
      nextMessage()
      expect(portfolioHeading()).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Back to the game' }))
      tick(100)
      expect(portfolioHeading()).not.toBeInTheDocument()
    }
  })

  it('keeps the page title for the game, and uses a portfolio title while it is open', () => {
    document.title = "Navin's Portfolio"
    render(<App />)
    startBattle()
    clickOption('RUN')
    nextMessage()
    expect(document.title).toBe('Navin Parthiban | Portfolio')
    fireEvent.click(screen.getByRole('button', { name: 'Back to the game' }))
    tick(100)
    expect(document.title).toBe("Navin's Portfolio")
  })
})

describe('App hash URL', () => {
  it('shows the plain portfolio straight away for /#portfolio, without the intro or the game', () => {
    window.history.replaceState(null, '', '/#portfolio')
    const { container } = render(<App />)
    expect(portfolioHeading()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SKIP' })).not.toBeInTheDocument()
    expect(screen.queryByText(introLines[0])).not.toBeInTheDocument()
    expect(container.querySelector('.stage')).toBeNull()
  })

  it('starts the game from the intro when Back to the game is used after a direct link', () => {
    window.history.replaceState(null, '', '/#portfolio')
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Back to the game' }))
    tick(100)
    expect(portfolioHeading()).not.toBeInTheDocument()
    expect(status()).toHaveTextContent(introLines[0])
    expect(screen.getByRole('button', { name: 'SKIP' })).toBeInTheDocument()
    expect(window.location.hash).toBe('')
  })

  it('shows the game for any other hash', () => {
    window.history.replaceState(null, '', '/#something-else')
    render(<App />)
    expect(portfolioHeading()).not.toBeInTheDocument()
    expect(status()).toHaveTextContent(introLines[0])
  })

  it('follows the browser: the portfolio hash opens it, and removing the hash comes back to the game', () => {
    render(<App />)
    startBattle()
    clickOption('RUN')
    nextMessage()
    goToHash('')
    expect(portfolioHeading()).not.toBeInTheDocument()
    expect(hasMenu()).toBe(true)
    goToHash('#portfolio')
    expect(portfolioHeading()).toBeInTheDocument()
  })

  it('keeps the battle when the portfolio is opened by editing the address', () => {
    render(<App />)
    startBattle()
    clickOption('FIGHT')
    clickOption('React')
    while (!hasMenu()) nextMessage()
    goToHash('#portfolio')
    expect(portfolioHeading()).toBeInTheDocument()
    goToHash('')
    expect(screen.getByRole('progressbar', { name: 'SCREENMON HP' })).toHaveAttribute('aria-valuenow', '20')
  })

  it('does not let Escape skip the intro while the portfolio is showing', () => {
    render(<App />)
    nextMessage()
    goToHash('#portfolio')
    expect(portfolioHeading()).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    goToHash('')
    expect(screen.getByRole('button', { name: 'SKIP' })).toBeInTheDocument()
    expect(status()).toHaveTextContent(introLines[1])
  })
})
