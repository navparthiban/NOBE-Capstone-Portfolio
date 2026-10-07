import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BattleScreen from './BattleScreen.jsx'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function tick(ms) {
  for (let elapsed = 0; elapsed < ms; elapsed += 25) {
    act(() => vi.advanceTimersByTime(25))
  }
}

function nextMessage() {
  tick(3000)
  fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
}

function skipIntro() {
  nextMessage()
  nextMessage()
}

function press(key) {
  fireEvent.keyDown(document.activeElement, { key })
}

function clickOption(name) {
  fireEvent.click(screen.getByRole('button', { name }))
}

function hasMenu() {
  return screen.queryByRole('group', { name: 'Battle menu' }) !== null
}

function playReactTurn() {
  clickOption('FIGHT')
  clickOption('React')
  while (!hasMenu()) nextMessage()
}

function status() {
  return screen.getByRole('status')
}

describe('BattleScreen intro', () => {
  it('plays the intro messages, then shows the menu with FIGHT focused', () => {
    render(<BattleScreen />)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
    expect(hasMenu()).toBe(false)
    nextMessage()
    expect(status()).toHaveTextContent('Recruiter sent out SCREENMON!')
    nextMessage()
    expect(hasMenu()).toBe(true)
    expect(status()).toHaveTextContent('What will PORYGON do?')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('types the message out, and a click finishes it before advancing', () => {
    const { container } = render(<BattleScreen />)
    const body = container.querySelector('.text-box__body')
    tick(100)
    expect(body).toHaveTextContent('A Re')
    expect(body).not.toHaveTextContent('battle')
    clickOption('Next message')
    expect(body).toHaveTextContent('A Recruiter wants to battle!')
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('focuses the text box so Enter can advance the message', () => {
    render(<BattleScreen />)
    expect(screen.getByRole('button', { name: 'Next message' })).toHaveFocus()
  })
})

describe('BattleScreen menus', () => {
  it('moves the cursor with the arrow keys and stops at the edges', () => {
    render(<BattleScreen />)
    skipIntro()
    press('ArrowRight')
    expect(screen.getByRole('button', { name: 'BAG' })).toHaveFocus()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: 'RUN' })).toHaveFocus()
    press('ArrowRight')
    press('ArrowDown')
    expect(screen.getByRole('button', { name: 'RUN' })).toHaveFocus()
  })

  it('keeps placeholder messages for BAG', () => {
    render(<BattleScreen />)
    skipIntro()
    clickOption('BAG')
    expect(status()).toHaveTextContent('Navin wants to BAG!')
  })

  it('opens the move menu with FIGHT and goes back with Escape', () => {
    render(<BattleScreen />)
    skipIntro()
    clickOption('FIGHT')
    for (const name of ['React', 'TypeScript', 'Java', 'Git', 'BACK']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'React' })).toHaveFocus()
    press('Escape')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('goes back with the BACK option', () => {
    render(<BattleScreen />)
    skipIntro()
    clickOption('FIGHT')
    clickOption('BACK')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toBeInTheDocument()
  })

  it('moves through the move menu with arrows and stops at BACK', () => {
    render(<BattleScreen />)
    skipIntro()
    clickOption('FIGHT')
    press('ArrowDown')
    press('ArrowDown')
    expect(screen.getByRole('button', { name: 'BACK' })).toHaveFocus()
    press('ArrowDown')
    press('ArrowRight')
    expect(screen.getByRole('button', { name: 'BACK' })).toHaveFocus()
  })
})

describe('BattleScreen battle', () => {
  it('shows the move message and lowers the opponent HP bar', () => {
    render(<BattleScreen />)
    skipIntro()
    clickOption('FIGHT')
    clickOption('React')
    expect(status()).toHaveTextContent('Navin used React! It built the frontend.')
    expect(screen.getByRole('progressbar', { name: 'SCREENMON HP' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    )
  })

  it('shows the Recruiter attacking back and returns to the menu', () => {
    render(<BattleScreen />)
    skipIntro()
    playReactTurn()
    expect(screen.getByRole('progressbar', { name: 'PORYGON HP' })).toHaveAttribute(
      'aria-valuenow',
      '56',
    )
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('sends out the next Pokémon only when its message appears', () => {
    render(<BattleScreen />)
    skipIntro()
    playReactTurn()
    clickOption('FIGHT')
    clickOption('React')
    const bar = (name) => screen.queryByRole('progressbar', { name: `${name} HP` })

    expect(status()).toHaveTextContent('Navin used React!')
    expect(bar('SCREENMON')).toHaveAttribute('aria-valuenow', '0')
    nextMessage()
    expect(status()).toHaveTextContent('SCREENMON fainted!')
    expect(bar('SCREENMON')).toBeInTheDocument()
    expect(bar('HIREMON')).not.toBeInTheDocument()
    nextMessage()
    expect(status()).toHaveTextContent('Recruiter sent out HIREMON!')
    expect(bar('HIREMON')).toHaveAttribute('aria-valuenow', '50')
    expect(bar('SCREENMON')).not.toBeInTheDocument()
  })

  it('reaches victory and Rematch restarts the battle', () => {
    render(<BattleScreen />)
    skipIntro()
    for (let turn = 0; turn < 20 && !screen.queryByRole('button', { name: 'REMATCH' }); turn++) {
      playReactTurn()
    }
    expect(screen.getByRole('button', { name: 'REMATCH' })).toHaveFocus()
    clickOption('REMATCH')
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
    expect(screen.getByRole('progressbar', { name: 'SCREENMON HP' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(screen.getByRole('progressbar', { name: 'PORYGON HP' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    )
  })
})

describe('BattleScreen party', () => {
  const partyNames = ['PORYGON', 'ELECTRODE', 'ALAKAZAM', 'MEOWTH', 'CHANSEY', 'MAGNETON']

  function openParty() {
    render(<BattleScreen />)
    skipIntro()
    clickOption('PARTY')
  }

  it('lists all six Pokémon with their level and HP bar', () => {
    openParty()
    for (const name of partyNames) {
      expect(screen.getByRole('button', { name: new RegExp(`^${name}, level `) })).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: `${name} HP` })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: /^PORYGON/ })).toHaveFocus()
  })

  it('opens the matching summary with the keyboard', () => {
    openParty()
    press('ArrowDown')
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /^ALAKAZAM/ })).toHaveFocus()
    fireEvent.click(document.activeElement)
    expect(screen.getByRole('heading', { name: /ALAKAZAM/ })).toBeInTheDocument()
    expect(screen.getByText('Mathnasium')).toBeInTheDocument()
    expect(screen.getByText('Math Instructor')).toBeInTheDocument()
    expect(screen.getByText('Work')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BACK' })).toHaveFocus()
  })

  it('opens the matching summary with a click', () => {
    openParty()
    clickOption(/^CHANSEY/)
    expect(screen.getByRole('heading', { name: /CHANSEY/ })).toBeInTheDocument()
    expect(screen.getByText('Edward Hospital')).toBeInTheDocument()
  })

  it('goes back one screen at a time with Escape', () => {
    openParty()
    press('ArrowDown')
    fireEvent.click(document.activeElement)
    expect(screen.getByRole('heading', { name: /ELECTRODE/ })).toBeInTheDocument()

    press('Escape')
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()

    press('Escape')
    expect(hasMenu()).toBe(true)
    expect(screen.getByRole('button', { name: 'PARTY' })).toHaveFocus()
  })

  it('goes back with the BACK buttons', () => {
    openParty()
    clickOption(/^MEOWTH/)
    clickOption('BACK')
    expect(screen.getByRole('button', { name: /^MEOWTH/ })).toHaveFocus()
    clickOption('BACK')
    expect(screen.getByRole('button', { name: 'PARTY' })).toHaveFocus()
  })

  it('stays on the first Pokémon when pressing up at the top of the list', () => {
    openParty()
    press('ArrowUp')
    expect(screen.getByRole('button', { name: /^PORYGON/ })).toHaveFocus()
  })

  it('shows the lead with lowered HP after a battle turn', () => {
    render(<BattleScreen />)
    skipIntro()
    playReactTurn()
    clickOption('PARTY')
    expect(screen.getByRole('progressbar', { name: 'PORYGON HP' })).toHaveAttribute('aria-valuenow', '56')
    expect(screen.getByRole('progressbar', { name: 'MEOWTH HP' })).toHaveAttribute('aria-valuenow', '50')
  })
})
