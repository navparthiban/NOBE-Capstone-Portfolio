import { act, fireEvent, render, screen, within } from '@testing-library/react'
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

const partyOpen = () => screen.queryByRole('region', { name: 'Party' }) !== null

function chooseFirstHealthy() {
  fireEvent.click(screen.getAllByRole('button', { name: /, level \d+, [1-9]\d* of/ })[0])
  clickOption('SWITCH')
}

function playReactTurn() {
  clickOption('FIGHT')
  clickOption('React')
  while (!hasMenu()) {
    if (partyOpen()) chooseFirstHealthy()
    else nextMessage()
  }
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
    expect(status()).toHaveTextContent('Go, PORYGON!')
    expect(hasMenu()).toBe(false)
    nextMessage()
    expect(hasMenu()).toBe(true)
    expect(status()).toHaveTextContent('What will PORYGON do?')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('keeps each side off the field until its own send-out message', () => {
    const { container } = render(<BattleScreen />)
    const sprite = (name) => screen.queryByRole('img', { name: `${name} sprite` })
    const fx = (name) => sprite(name).closest('.sprite').dataset.fx
    expect(sprite('SCREENMON')).not.toBeInTheDocument()
    expect(sprite('PORYGON')).not.toBeInTheDocument()
    expect(container.querySelector('.status')).not.toBeInTheDocument()

    nextMessage()
    expect(status()).toHaveTextContent('Recruiter sent out SCREENMON!')
    expect(fx('SCREENMON')).toBe('sendout')
    expect(container.querySelector('.status--opponent')).toHaveTextContent('SCREENMON')
    expect(sprite('PORYGON')).not.toBeInTheDocument()
    expect(container.querySelector('.status--player')).not.toBeInTheDocument()

    nextMessage()
    expect(status()).toHaveTextContent('Go, PORYGON!')
    expect(fx('PORYGON')).toBe('sendout')
    expect(container.querySelector('.status--player')).toHaveTextContent('PORYGON')
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
      '50',
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
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    skipIntro()
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
    const partyScreen = within(screen.getByRole('region', { name: 'Party' }))
    expect(partyScreen.getByText('60/60')).toBeInTheDocument()
    expect(partyScreen.getByText('90/90')).toBeInTheDocument()
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
    expect(screen.getByRole('progressbar', { name: 'PORYGON HP' })).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByRole('progressbar', { name: 'MEOWTH HP' })).toHaveAttribute('aria-valuenow', '50')
  })
})

describe('BattleScreen field', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', () => new Promise(() => {}))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function fieldSprites(container) {
    return [container.querySelector('.sprite--player'), container.querySelector('.sprite--opponent')]
  }

  it('keeps the same sprites, so no send-out replays, after visiting PARTY and coming back', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    const before = fieldSprites(container)
    clickOption('PARTY')
    expect(screen.queryByRole('img', { name: 'SCREENMON sprite' })).not.toBeInTheDocument()
    clickOption('CANCEL')
    const after = fieldSprites(container)
    expect(after[0]).toBe(before[0])
    expect(after[1]).toBe(before[1])
    clickOption('PARTY')
    clickOption(/^ELECTRODE/)
    clickOption('SUMMARY')
    press('Escape')
    press('Escape')
    press('Escape')
    expect(fieldSprites(container)[0]).toBe(before[0])
    expect(fieldSprites(container)[1]).toBe(before[1])
  })

  it('keeps the same sprites after visiting BAG and coming back', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    const before = fieldSprites(container)
    clickOption('BAG')
    press('Escape')
    expect(fieldSprites(container)[0]).toBe(before[0])
    expect(fieldSprites(container)[1]).toBe(before[1])
    expect(hasMenu()).toBe(true)
  })

  it('hides the field while another screen is open', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    const field = container.querySelector('.field')
    expect(field).not.toHaveAttribute('aria-hidden', 'true')
    clickOption('PARTY')
    expect(field).toHaveAttribute('aria-hidden', 'true')
    expect(field).toHaveClass('field--away')
    clickOption('CANCEL')
    expect(field).not.toHaveAttribute('aria-hidden', 'true')
    expect(field).not.toHaveClass('field--away')
  })

  it('does not replay the send-out when coming back after a switch either', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    clickOption('PARTY')
    clickOption(/^ALAKAZAM/)
    clickOption('SWITCH')
    while (!hasMenu()) nextMessage()
    const before = fieldSprites(container)
    clickOption('BAG')
    press('Escape')
    expect(fieldSprites(container)[0]).toBe(before[0])
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
    expect(status()).toHaveTextContent('SCREENMON used Interview! ALAKAZAM took 10 damage.')
    expect(playerStatus(container)).toHaveTextContent('45/55')

    nextMessage()
    expect(hasMenu()).toBe(true)
    expect(status()).toHaveTextContent('What will ALAKAZAM do?')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('keeps each Pokémon\'s HP when switching away and back', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    playReactTurn()
    expect(playerStatus(container)).toHaveTextContent('50/60')
    clickOption('PARTY')
    clickOption(/^ALAKAZAM/)
    clickOption('SWITCH')
    while (!hasMenu()) nextMessage()
    clickOption('PARTY')
    clickOption(/^PORYGON/)
    clickOption('SWITCH')
    while (!hasMenu()) nextMessage()
    expect(playerStatus(container)).toHaveTextContent('PORYGON')
    expect(playerStatus(container)).toHaveTextContent('40/60')
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

describe('BattleScreen fainting', () => {
  const sprite = (name) => screen.queryByRole('img', { name: `${name} sprite` })

  function playUntilForced() {
    const seen = []
    let atFaint = null
    for (let turn = 0; turn < 15; turn++) {
      clickOption('FIGHT')
      clickOption('React')
      while (!hasMenu() && !partyOpen()) {
        const text = status().textContent
        seen.push(text)
        if (text.includes('PORYGON fainted!')) {
          atFaint = {
            fx: sprite('PORYGON')?.closest('.sprite').dataset.fx,
            statusBox: document.querySelector('.status--player') !== null,
          }
        }
        nextMessage()
      }
      if (partyOpen()) return { seen, atFaint }
    }
    throw new Error('the lead never fainted')
  }

  it('shows the faint on the field, then opens the party by itself and asks for a Pokémon', () => {
    render(<BattleScreen />)
    skipIntro()
    const { seen, atFaint } = playUntilForced()
    expect(seen.at(-1)).toContain('PORYGON fainted!')
    expect(atFaint).toEqual({ fx: 'faint', statusBox: false })
    expect(status()).toHaveTextContent('Bring out which Pokémon?')
    expect(screen.queryByRole('button', { name: 'CANCEL' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^PORYGON, level 18, 0 of 60 HP, fainted/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^ELECTRODE/ })).toHaveFocus()
  })

  it('does not let Escape leave the forced party', () => {
    render(<BattleScreen />)
    skipIntro()
    playUntilForced()
    press('Escape')
    expect(partyOpen()).toBe(true)
    expect(status()).toHaveTextContent('Bring out which Pokémon?')
  })

  it('sends out the chosen Pokémon without a recall or an attack, then continues the battle', () => {
    const { container } = render(<BattleScreen />)
    skipIntro()
    playUntilForced()
    fireEvent.click(screen.getByRole('button', { name: /^ALAKAZAM/ }))
    clickOption('SWITCH')
    expect(partyOpen()).toBe(false)
    expect(status()).toHaveTextContent('Go, ALAKAZAM!')
    expect(container.querySelector('.status--player')).toHaveTextContent('ALAKAZAM')
    expect(container.querySelector('.status--player')).toHaveTextContent('55/55')
    nextMessage()
    expect(hasMenu()).toBe(true)
    expect(status()).toHaveTextContent('What will ALAKAZAM do?')
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
  })

  it('does not let the visitor bring out a Pokémon that has fainted', () => {
    render(<BattleScreen />)
    skipIntro()
    playUntilForced()
    fireEvent.click(screen.getByRole('button', { name: /^PORYGON/ }))
    clickOption('SWITCH')
    expect(status()).toHaveTextContent('PORYGON has no energy left!')
    nextMessage()
    expect(partyOpen()).toBe(true)
    expect(status()).toHaveTextContent('Bring out which Pokémon?')
  })

  it('lets the visitor open a summary while forced and come back to the same choice', () => {
    render(<BattleScreen />)
    skipIntro()
    playUntilForced()
    fireEvent.click(screen.getByRole('button', { name: /^MEOWTH/ }))
    clickOption('SUMMARY')
    expect(screen.getByRole('heading', { name: /MEOWTH/ })).toBeInTheDocument()
    press('Escape')
    expect(screen.getByRole('button', { name: /^MEOWTH/ })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'CANCEL' })).not.toBeInTheDocument()
  })

  it('still reaches victory when the lead faints along the way', () => {
    render(<BattleScreen />)
    skipIntro()
    for (let turn = 0; turn < 40 && !screen.queryByRole('button', { name: 'REMATCH' }); turn++) {
      playReactTurn()
    }
    expect(screen.getByRole('button', { name: 'REMATCH' })).toHaveFocus()
  })
})
