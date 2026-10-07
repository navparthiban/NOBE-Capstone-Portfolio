import { describe, expect, it } from 'vitest'
import {
  battleReducer,
  createBattle,
  getHpPercent,
  getMenuOptions,
  getPrompt,
  getSelectionMessage,
  moveCursor,
  takeTurn,
} from './battle.js'

const REACT = 0
const GIT = 3

function clearQueue(state) {
  let current = state
  while (current.queue.length > 0) current = battleReducer(current, { type: 'advance' })
  return current
}

function openFight(state) {
  return battleReducer(clearQueue(state), { type: 'select', index: 0 })
}

function play(state, moveIndex) {
  return battleReducer(openFight(state), { type: 'select', index: moveIndex })
}

function playUntilVictory(state, moveIndex) {
  let current = state
  for (let turn = 0; turn < 50 && current.menu !== 'victory'; turn++) {
    current = play(current, moveIndex)
  }
  return current
}

describe('getMenuOptions', () => {
  it('returns the main menu options in order', () => {
    expect(getMenuOptions()).toEqual(['FIGHT', 'BAG', 'PARTY', 'RUN'])
  })

  it('returns the four moves and BACK for the fight menu', () => {
    expect(getMenuOptions('fight')).toEqual(['React', 'TypeScript', 'Java', 'Git', 'BACK'])
  })

  it('returns only REMATCH after victory', () => {
    expect(getMenuOptions('victory')).toEqual(['REMATCH'])
  })
})

describe('moveCursor', () => {
  it('moves right and down through the 2x2 grid', () => {
    expect(moveCursor(0, 'ArrowRight')).toBe(1)
    expect(moveCursor(0, 'ArrowDown')).toBe(2)
    expect(moveCursor(1, 'ArrowDown')).toBe(3)
  })

  it('moves left and up through the 2x2 grid', () => {
    expect(moveCursor(3, 'ArrowLeft')).toBe(2)
    expect(moveCursor(3, 'ArrowUp')).toBe(1)
    expect(moveCursor(2, 'ArrowUp')).toBe(0)
  })

  it('stays put at the edges instead of wrapping', () => {
    expect(moveCursor(0, 'ArrowUp')).toBe(0)
    expect(moveCursor(0, 'ArrowLeft')).toBe(0)
    expect(moveCursor(1, 'ArrowRight')).toBe(1)
    expect(moveCursor(1, 'ArrowUp')).toBe(1)
    expect(moveCursor(2, 'ArrowLeft')).toBe(2)
    expect(moveCursor(2, 'ArrowDown')).toBe(2)
    expect(moveCursor(3, 'ArrowRight')).toBe(3)
    expect(moveCursor(3, 'ArrowDown')).toBe(3)
  })

  it('ignores keys that are not arrows', () => {
    expect(moveCursor(1, 'a')).toBe(1)
    expect(moveCursor(2, 'Enter')).toBe(2)
  })

  it('does not move onto a missing option in an uneven grid', () => {
    expect(moveCursor(2, 'ArrowRight', 3)).toBe(2)
    expect(moveCursor(1, 'ArrowDown', 3)).toBe(1)
    expect(moveCursor(2, 'ArrowDown', 5)).toBe(4)
    expect(moveCursor(4, 'ArrowRight', 5)).toBe(4)
  })
})

describe('getSelectionMessage', () => {
  it('shows the message for each option', () => {
    expect(getSelectionMessage('BAG')).toBe('Navin wants to BAG!')
    expect(getSelectionMessage('RUN')).toBe('Navin wants to RUN!')
  })
})

describe('getHpPercent', () => {
  it('returns the percent of HP left', () => {
    expect(getHpPercent(30, 60)).toBe(50)
  })

  it('clamps below 0 and above max', () => {
    expect(getHpPercent(-5, 60)).toBe(0)
    expect(getHpPercent(90, 60)).toBe(100)
  })

  it('returns 0 when max HP is 0', () => {
    expect(getHpPercent(10, 0)).toBe(0)
  })
})

describe('createBattle', () => {
  it('starts with everyone at full HP and the intro messages queued', () => {
    const state = createBattle()
    expect(state.player.hp).toBe(state.player.maxHp)
    expect(state.team).toHaveLength(3)
    expect(state.team.every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true)
    expect(state.active).toBe(0)
    expect(state.queue).toEqual(['A Recruiter wants to battle!', 'Recruiter sent out SCREENMON!'])
  })
})

describe('message queue', () => {
  it('advances one message at a time', () => {
    let state = createBattle()
    state = battleReducer(state, { type: 'advance' })
    expect(state.queue).toEqual(['Recruiter sent out SCREENMON!'])
    state = battleReducer(state, { type: 'advance' })
    expect(state.queue).toEqual([])
  })

  it('ignores menu input while messages are waiting', () => {
    const state = createBattle()
    expect(battleReducer(state, { type: 'select', index: 0 })).toBe(state)
    expect(battleReducer(state, { type: 'cursor', key: 'ArrowRight' })).toBe(state)
  })

  it('shows a prompt for the current menu', () => {
    const state = clearQueue(createBattle())
    expect(getPrompt(state)).toBe('What will NAVINMON do?')
    expect(getPrompt(openFight(state))).toBe('Choose a move.')
  })
})

describe('menus', () => {
  it('opens the move menu when FIGHT is selected', () => {
    const state = openFight(createBattle())
    expect(state.menu).toBe('fight')
    expect(state.cursor).toBe(0)
  })

  it('returns to the main menu with BACK or Escape', () => {
    const fight = openFight(createBattle())
    const viaBack = battleReducer(fight, { type: 'select', index: 4 })
    const viaEscape = battleReducer(fight, { type: 'back' })
    expect(viaBack.menu).toBe('main')
    expect(viaEscape.menu).toBe('main')
  })

  it('ignores Escape on the main menu', () => {
    const state = clearQueue(createBattle())
    expect(battleReducer(state, { type: 'back' })).toBe(state)
  })

  it('queues placeholder messages for BAG, PARTY, and RUN', () => {
    const state = clearQueue(createBattle())
    const bag = battleReducer(state, { type: 'select', index: 1 })
    expect(bag.queue).toEqual(['Navin wants to BAG!'])
    expect(battleReducer(state, { type: 'select', index: 2 }).queue).toEqual(['Navin wants to PARTY!'])
    expect(battleReducer(state, { type: 'select', index: 3 }).queue).toEqual(['Navin wants to RUN!'])
  })

  it('moves the cursor through the move menu without wrapping', () => {
    let state = openFight(createBattle())
    state = battleReducer(state, { type: 'cursor', key: 'ArrowDown' })
    state = battleReducer(state, { type: 'cursor', key: 'ArrowDown' })
    expect(state.cursor).toBe(4)
    state = battleReducer(state, { type: 'cursor', key: 'ArrowDown' })
    state = battleReducer(state, { type: 'cursor', key: 'ArrowRight' })
    expect(state.cursor).toBe(4)
  })
})

describe('takeTurn', () => {
  it('lowers the opponent HP by the move damage and queues the move message', () => {
    const state = play(createBattle(), REACT)
    expect(state.team[0].hp).toBe(20)
    expect(state.queue[0]).toBe('Navin used React! It built the frontend.')
  })

  it('has the opponent attack back for small damage', () => {
    const state = play(createBattle(), REACT)
    expect(state.player.hp).toBe(56)
    expect(state.queue[1]).toBe('SCREENMON used Interview! NAVINMON took 4 damage.')
  })

  it('sends out the next Pokémon when one faints, without a counterattack', () => {
    let state = play(createBattle(), REACT)
    state = play(state, REACT)
    expect(state.team[0].hp).toBe(0)
    expect(state.active).toBe(1)
    expect(state.player.hp).toBe(56)
    expect(state.queue).toEqual([
      'Navin used React! It built the frontend.',
      'SCREENMON fainted!',
      'Recruiter sent out HIREMON!',
    ])
  })

  it('triggers victory after all three faint', () => {
    const state = playUntilVictory(createBattle(), REACT)
    expect(state.menu).toBe('victory')
    expect(state.team.every((pokemon) => pokemon.hp === 0)).toBe(true)
    expect(state.queue.slice(-2)).toEqual(['Recruiter has no Pokémon left!', 'Navin won the battle!'])
    expect(state.player.hp).toBeGreaterThanOrEqual(1)
  })

  it('never drops opponent HP below 0', () => {
    const start = createBattle()
    const weak = { ...start, team: start.team.map((p, i) => (i === 0 ? { ...p, hp: 5 } : p)) }
    expect(play(weak, REACT).team[0].hp).toBe(0)
  })

  it('never drops player HP below 1, and reports the real damage', () => {
    const start = createBattle()
    let state = {
      ...start,
      player: { ...start.player, hp: 3 },
      team: start.team.map((p, i) => (i === 0 ? { ...p, hp: 1000 } : p)),
    }
    state = play(state, GIT)
    expect(state.player.hp).toBe(1)
    expect(state.queue[1]).toContain('took 2 damage')
    for (let turn = 0; turn < 5; turn++) state = play(state, GIT)
    expect(state.player.hp).toBe(1)
    expect(state.queue[1]).toContain('took 0 damage')
  })

  it('ignores moves outside the fight menu and unknown moves', () => {
    const main = clearQueue(createBattle())
    expect(takeTurn(main, REACT)).toBe(main)
    const fight = openFight(createBattle())
    expect(takeTurn(fight, 99)).toBe(fight)
  })

  it('cannot be used after victory', () => {
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(takeTurn(victory, REACT)).toBe(victory)
    expect(battleReducer(victory, { type: 'back' })).toBe(victory)
    expect(battleReducer(victory, { type: 'select', index: 1 })).toBe(victory)
  })
})

describe('rematch', () => {
  it('restores the starting state', () => {
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(battleReducer(victory, { type: 'select', index: 0 })).toEqual(createBattle())
  })
})
