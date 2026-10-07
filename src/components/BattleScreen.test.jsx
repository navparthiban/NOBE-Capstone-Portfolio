import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FrameContext } from '../hooks/useFrame.js'
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

  it('keeps placeholder messages for RUN', () => {
    render(<BattleScreen />)
    skipIntro()
    clickOption('RUN')
    expect(status()).toHaveTextContent('Navin wants to RUN!')
  })

  describe('bag', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', () => new Promise(() => {}))
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    function openBag() {
      render(<BattleScreen />)
      skipIntro()
      clickOption('BAG')
    }

    it('opens the bag with BAG and focuses the first item', () => {
      openBag()
      expect(screen.getByRole('region', { name: 'Bag' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /RESUME/ })).toHaveFocus()
    })

    it('moves through the items with arrows and stops at CANCEL', () => {
      openBag()
      press('ArrowDown')
      expect(screen.getByRole('link', { name: /GITHUB/ })).toHaveFocus()
      for (let i = 0; i < 6; i++) press('ArrowDown')
      expect(screen.getByRole('button', { name: 'CANCEL' })).toHaveFocus()
    })

    it('returns to the main menu with Escape and focuses BAG', () => {
      openBag()
      press('ArrowDown')
      press('Escape')
      expect(screen.queryByRole('region', { name: 'Bag' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'BAG' })).toHaveFocus()
    })

    it('returns to the main menu with CANCEL', () => {
      openBag()
      clickOption('CANCEL')
      expect(screen.getByRole('button', { name: 'BAG' })).toHaveFocus()
    })
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

  it('shows a grid of all six Pokémon with level, HP bar, and HP numbers', () => {
    openParty()
    for (const name of partyNames) {
      expect(screen.getByRole('button', { name: new RegExp(`^${name}, level `) })).toBeInTheDocument()
      expect(screen.getByRole('progressbar', { name: `${name} HP` })).toBeInTheDocument()
    }
    expect(screen.getByText('60/60')).toBeInTheDocument()
    expect(screen.getByText('90/90')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^PORYGON/ })).toHaveFocus()
  })

  it('shows the prompt and a CANCEL button', () => {
    openParty()
    expect(status()).toHaveTextContent('Choose a Pokémon.')
    expect(screen.getByRole('button', { name: 'CANCEL' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'BACK' })).not.toBeInTheDocument()
  })

  it('highlights only the selected card', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    clickOption('PARTY')
    const selected = () => [...container.querySelectorAll('.party__card--selected')]
    expect(selected()).toHaveLength(1)
    expect(selected()[0]).toHaveAccessibleName(/^PORYGON/)
    press('ArrowRight')
    expect(selected()).toHaveLength(1)
    expect(selected()[0]).toHaveAccessibleName(/^ELECTRODE/)
  })

  it('moves through the grid in all four directions', () => {
    openParty()
    press('ArrowRight')
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /^MEOWTH/ })).toHaveFocus()
    press('ArrowLeft')
    expect(screen.getByRole('button', { name: /^ALAKAZAM/ })).toHaveFocus()
    press('ArrowUp')
    expect(screen.getByRole('button', { name: /^PORYGON/ })).toHaveFocus()
  })

  it('reaches CANCEL from the bottom row and goes back to the main menu with Enter', () => {
    openParty()
    press('ArrowRight')
    press('ArrowDown')
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /^MAGNETON/ })).toHaveFocus()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: 'CANCEL' })).toHaveFocus()
    press('ArrowUp')
    expect(screen.getByRole('button', { name: /^MAGNETON/ })).toHaveFocus()
    press('ArrowDown')
    fireEvent.click(document.activeElement)
    expect(screen.getByRole('button', { name: 'PARTY' })).toHaveFocus()
  })

  it('keeps the cursor on a valid button when pressing arrows at the edges of the grid', () => {
    openParty()
    press('ArrowUp')
    press('ArrowLeft')
    expect(screen.getByRole('button', { name: /^PORYGON/ })).toHaveFocus()

    press('ArrowRight')
    press('ArrowRight')
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()

    for (let step = 0; step < 5; step++) press('ArrowDown')
    expect(screen.getByRole('button', { name: 'CANCEL' })).toHaveFocus()
    press('ArrowRight')
    press('ArrowLeft')
    press('ArrowDown')
    expect(screen.getByRole('button', { name: 'CANCEL' })).toHaveFocus()
    expect(screen.getAllByRole('progressbar')).toHaveLength(6)
  })

  it('opens the matching summary with the keyboard', () => {
    openParty()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /^ALAKAZAM/ })).toHaveFocus()
    fireEvent.click(document.activeElement)
    expect(screen.getByRole('button', { name: 'SWITCH' })).toHaveFocus()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: 'SUMMARY' })).toHaveFocus()
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
    clickOption('SUMMARY')
    expect(screen.getByRole('heading', { name: /CHANSEY/ })).toBeInTheDocument()
    expect(screen.getByText('Edward Hospital')).toBeInTheDocument()
  })

  it('goes back one screen at a time with Escape', () => {
    openParty()
    press('ArrowRight')
    fireEvent.click(document.activeElement)
    clickOption('SUMMARY')
    expect(screen.getByRole('heading', { name: /ELECTRODE/ })).toBeInTheDocument()

    press('Escape')
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()

    press('Escape')
    expect(hasMenu()).toBe(true)
    expect(screen.getByRole('button', { name: 'PARTY' })).toHaveFocus()
  })

  it('goes back with the BACK and CANCEL buttons', () => {
    openParty()
    clickOption(/^MEOWTH/)
    clickOption('SUMMARY')
    clickOption('BACK')
    expect(screen.getByRole('button', { name: /^MEOWTH/ })).toHaveFocus()
    clickOption('CANCEL')
    expect(screen.getByRole('button', { name: 'PARTY' })).toHaveFocus()
  })

  it('goes back to the main menu with Escape from the list', () => {
    openParty()
    press('ArrowDown')
    press('Escape')
    expect(screen.getByRole('button', { name: 'PARTY' })).toHaveFocus()
  })

  it('falls back to one column when the frame is portrait', () => {
    render(
      <FrameContext.Provider value={{ orientation: 'portrait' }}>
        <BattleScreen />
      </FrameContext.Provider>,
    )
    skipIntro()
    clickOption('PARTY')
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()
    press('ArrowRight')
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /^ALAKAZAM/ })).toHaveFocus()
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

describe('BattleScreen switching', () => {
  function openPartyMenu(name) {
    render(<BattleScreen />)
    skipIntro()
    clickOption('PARTY')
    clickOption(name)
  }

  const sprite = (name) => screen.queryByRole('img', { name: `${name} sprite` })
  const fx = (name) => sprite(name)?.closest('.sprite').dataset.fx
  const playerStatus = (container) => container.querySelector('.status--player')

  it('opens a small menu with SWITCH, SUMMARY and CANCEL, and asks what to do', () => {
    openPartyMenu(/^ALAKAZAM/)
    for (const name of ['SWITCH', 'SUMMARY', 'CANCEL']) {
      expect(screen.getAllByRole('button', { name })).not.toHaveLength(0)
    }
    expect(screen.getByRole('button', { name: 'SWITCH' })).toHaveFocus()
    expect(status()).toHaveTextContent('Do what with ALAKAZAM?')
  })

  it('goes back to the grid with CANCEL or Escape, on the same card', () => {
    openPartyMenu(/^ALAKAZAM/)
    press('Escape')
    expect(screen.getByRole('button', { name: /^ALAKAZAM/ })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'SWITCH' })).not.toBeInTheDocument()
    fireEvent.click(document.activeElement)
    fireEvent.click(screen.getAllByRole('button', { name: 'CANCEL' })[0])
    expect(screen.getByRole('button', { name: /^ALAKAZAM/ })).toHaveFocus()
  })

  it('ignores clicks on the other cards while the small menu is open', () => {
    openPartyMenu(/^ALAKAZAM/)
    fireEvent.click(screen.getByRole('button', { name: /^ELECTRODE/ }))
    expect(screen.getByRole('button', { name: 'SWITCH' })).toBeInTheDocument()
    expect(status()).toHaveTextContent('Do what with ALAKAZAM?')
  })

  it('recalls the old Pokémon, then sends out the new one, then the Recruiter attacks', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    clickOption('PARTY')
    clickOption(/^ALAKAZAM/)
    clickOption('SWITCH')

    expect(status()).toHaveTextContent('Come back, PORYGON!')
    expect(fx('PORYGON')).toBe('recall')
    expect(sprite('ALAKAZAM')).not.toBeInTheDocument()
    expect(playerStatus(container)).toHaveTextContent('PORYGON')

    nextMessage()
    expect(status()).toHaveTextContent('Go, ALAKAZAM!')
    expect(fx('ALAKAZAM')).toBe('sendout')
    expect(sprite('PORYGON')).not.toBeInTheDocument()
    expect(playerStatus(container)).toHaveTextContent('ALAKAZAM')
    expect(playerStatus(container)).toHaveTextContent('Lv26')
    expect(playerStatus(container)).toHaveTextContent('55/55')

    nextMessage()
    expect(status()).toHaveTextContent('SCREENMON used Interview! ALAKAZAM took 4 damage.')
    expect(playerStatus(container)).toHaveTextContent('51/55')

    nextMessage()
    expect(hasMenu()).toBe(true)
    expect(status()).toHaveTextContent('What will ALAKAZAM do?')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('keeps each Pokémon\'s HP when switching away and back', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    playReactTurn()
    expect(playerStatus(container)).toHaveTextContent('56/60')
    clickOption('PARTY')
    clickOption(/^ALAKAZAM/)
    clickOption('SWITCH')
    while (!hasMenu()) nextMessage()
    clickOption('PARTY')
    clickOption(/^PORYGON/)
    clickOption('SWITCH')
    while (!hasMenu()) nextMessage()
    expect(playerStatus(container)).toHaveTextContent('PORYGON')
    expect(playerStatus(container)).toHaveTextContent('52/60')
  })

  it('only shows a message when switching to the Pokémon already in battle', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    clickOption('PARTY')
    clickOption(/^PORYGON/)
    clickOption('SWITCH')
    expect(status()).toHaveTextContent('PORYGON is already in battle!')
    expect(screen.getByRole('button', { name: 'Next message' })).toHaveFocus()
    nextMessage()
    expect(screen.getByRole('button', { name: /^PORYGON/ })).toHaveFocus()
    expect(status()).toHaveTextContent('Choose a Pokémon.')
    fireEvent.click(screen.getByRole('button', { name: 'CANCEL' }))
    expect(playerStatus(container)).toHaveTextContent('PORYGON')
    expect(playerStatus(container)).toHaveTextContent('60/60')
    expect(hasMenu()).toBe(true)
  })

  it("does not show the Recruiter's next Pokémon until the send-out message", () => {
    render(<BattleScreen />)
    skipIntro()
    playReactTurn()
    clickOption('FIGHT')
    clickOption('React')
    expect(sprite('SCREENMON')).toBeInTheDocument()
    expect(sprite('HIREMON')).not.toBeInTheDocument()
    nextMessage()
    expect(status()).toHaveTextContent('SCREENMON fainted!')
    expect(sprite('HIREMON')).not.toBeInTheDocument()
    nextMessage()
    expect(status()).toHaveTextContent('Recruiter sent out HIREMON!')
    expect(sprite('SCREENMON')).not.toBeInTheDocument()
    expect(fx('HIREMON')).toBe('sendout')
  })
})
