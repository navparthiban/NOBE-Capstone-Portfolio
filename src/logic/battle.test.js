import { describe, expect, it } from 'vitest'
import { party } from '../data/party.js'
import {
  battleReducer,
  createBattle,
  getHpPercent,
  getLead,
  getMenuOptions,
  getPrompt,
  getSelectionMessage,
  moveCursor,
  takeTurn,
} from './battle.js'

const REACT = 0
const GIT = 3
const PARTY_OPTION = 2

function texts(state) {
  return state.queue.map((message) => message.text)
}

function advance(state) {
  return battleReducer(state, { type: 'advance' })
}

function clearQueue(state) {
  let current = state
  while (current.queue.length > 0) current = advance(current)
  return current
}

function select(state, index) {
  return battleReducer(state, { type: 'select', index })
}

function openFight(state) {
  return select(clearQueue(state), 0)
}

function openParty(state) {
  return select(clearQueue(state), PARTY_OPTION)
}

function play(state, moveIndex) {
  return select(openFight(state), moveIndex)
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

  it('returns the six party names and BACK for the party list', () => {
    expect(getMenuOptions('party')).toEqual([...party.map((pokemon) => pokemon.name), 'BACK'])
  })

  it('returns only BACK for a summary', () => {
    expect(getMenuOptions('summary')).toEqual(['BACK'])
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

  it('moves only up and down in a single column', () => {
    expect(moveCursor(0, 'ArrowDown', 7, 1)).toBe(1)
    expect(moveCursor(1, 'ArrowUp', 7, 1)).toBe(0)
    expect(moveCursor(1, 'ArrowRight', 7, 1)).toBe(1)
    expect(moveCursor(1, 'ArrowLeft', 7, 1)).toBe(1)
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
    expect(state.party).toHaveLength(6)
    expect(state.party.every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true)
    expect(state.team).toHaveLength(3)
    expect(state.team.every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true)
    expect(state.active).toBe(0)
    expect(texts(state)).toEqual(['A Recruiter wants to battle!', 'Recruiter sent out SCREENMON!'])
  })

  it('leads with the first Pokémon in the party', () => {
    const state = createBattle()
    expect(state.lead).toBe(0)
    expect(getLead(state).name).toBe('PORYGON')
  })
})

describe('message queue', () => {
  it('advances one message at a time', () => {
    let state = createBattle()
    state = advance(state)
    expect(texts(state)).toEqual(['Recruiter sent out SCREENMON!'])
    state = advance(state)
    expect(texts(state)).toEqual([])
  })

  it('ignores menu input while messages are waiting', () => {
    const state = createBattle()
    expect(select(state, 0)).toBe(state)
    expect(battleReducer(state, { type: 'cursor', key: 'ArrowRight' })).toBe(state)
  })

  it('shows a prompt for the current menu', () => {
    const state = clearQueue(createBattle())
    expect(getPrompt(state)).toBe('What will PORYGON do?')
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
    const viaBack = select(fight, 4)
    const viaEscape = battleReducer(fight, { type: 'back' })
    expect(viaBack.menu).toBe('main')
    expect(viaEscape.menu).toBe('main')
  })

  it('ignores Escape on the main menu', () => {
    const state = clearQueue(createBattle())
    expect(battleReducer(state, { type: 'back' })).toBe(state)
  })

  it('queues placeholder messages for BAG and RUN', () => {
    const state = clearQueue(createBattle())
    const message = (index) => texts(select(state, index))
    expect(message(1)).toEqual(['Navin wants to BAG!'])
    expect(message(3)).toEqual(['Navin wants to RUN!'])
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

describe('party', () => {
  it('opens the party list when PARTY is selected', () => {
    const state = openParty(createBattle())
    expect(state.menu).toBe('party')
    expect(state.cursor).toBe(0)
    expect(state.queue).toEqual([])
  })

  it('opens the matching summary when a Pokémon is selected', () => {
    const state = select(openParty(createBattle()), 2)
    expect(state.menu).toBe('summary')
    expect(state.selected).toBe(2)
    expect(party[state.selected].name).toBe('ALAKAZAM')
    expect(getMenuOptions(state.menu)).toEqual(['BACK'])
  })

  it('selects with the cursor when no index is given', () => {
    let state = openParty(createBattle())
    state = battleReducer(state, { type: 'cursor', key: 'ArrowDown' })
    state = battleReducer(state, { type: 'select' })
    expect(state.menu).toBe('summary')
    expect(state.selected).toBe(1)
  })

  it('goes from the summary back to the list with the cursor on that Pokémon', () => {
    const summary = select(openParty(createBattle()), 3)
    const list = battleReducer(summary, { type: 'back' })
    expect(list.menu).toBe('party')
    expect(list.cursor).toBe(3)
    expect(select(summary, 0).menu).toBe('party')
  })

  it('goes from the list back to the main menu with the cursor on PARTY', () => {
    const list = openParty(createBattle())
    const viaEscape = battleReducer(list, { type: 'back' })
    const viaBack = select(list, 6)
    for (const state of [viaEscape, viaBack]) {
      expect(state.menu).toBe('main')
      expect(state.cursor).toBe(PARTY_OPTION)
    }
  })

  it('moves up and down the list without wrapping', () => {
    let state = openParty(createBattle())
    state = battleReducer(state, { type: 'cursor', key: 'ArrowUp' })
    expect(state.cursor).toBe(0)
    state = battleReducer(state, { type: 'cursor', key: 'ArrowRight' })
    expect(state.cursor).toBe(0)
    for (let step = 0; step < 10; step++) {
      state = battleReducer(state, { type: 'cursor', key: 'ArrowDown' })
    }
    expect(state.cursor).toBe(6)
  })

  it('does nothing for a Pokémon that does not exist', () => {
    const list = openParty(createBattle())
    expect(select(list, 99)).toBe(list)
  })

  it('shows lowered HP for the lead after a counterattack and full HP for the rest', () => {
    const state = clearQueue(play(createBattle(), REACT))
    expect(state.party[0].hp).toBe(56)
    expect(state.party.slice(1).every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true)
  })

  it('resets the party and selection on rematch', () => {
    const summary = select(openParty(createBattle()), 4)
    expect(summary.selected).toBe(4)
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(select(victory, 0)).toEqual(createBattle())
  })
})

describe('takeTurn', () => {
  it('lowers the opponent HP by the move damage and queues the move message', () => {
    const state = play(createBattle(), REACT)
    expect(state.team[0].hp).toBe(20)
    expect(texts(state)[0]).toBe('Navin used React! It built the frontend.')
  })

  it('has the opponent attack back for small damage', () => {
    const state = play(createBattle(), REACT)
    expect(texts(state)[1]).toBe('SCREENMON used Interview! PORYGON took 4 damage.')
    expect(getLead(clearQueue(state)).hp).toBe(56)
  })

  it('sends out the next Pokémon when one faints, without a counterattack', () => {
    let state = play(createBattle(), REACT)
    state = play(state, REACT)
    expect(state.team[0].hp).toBe(0)
    expect(getLead(state).hp).toBe(56)
    expect(texts(state)).toEqual([
      'Navin used React! It built the frontend.',
      'SCREENMON fainted!',
      'Recruiter sent out HIREMON!',
    ])
    const finished = clearQueue(state)
    expect(finished.active).toBe(1)
    expect(getLead(finished).hp).toBe(56)
  })

  it('triggers victory after all three faint', () => {
    const state = playUntilVictory(createBattle(), REACT)
    expect(state.menu).toBe('victory')
    expect(state.team.every((pokemon) => pokemon.hp === 0)).toBe(true)
    expect(texts(state).slice(-2)).toEqual(['Recruiter has no Pokémon left!', 'Navin won the battle!'])
    expect(getLead(clearQueue(state)).hp).toBeGreaterThanOrEqual(1)
  })

  it('never drops opponent HP below 0', () => {
    const start = createBattle()
    const weak = { ...start, team: start.team.map((p, i) => (i === 0 ? { ...p, hp: 5 } : p)) }
    expect(play(weak, REACT).team[0].hp).toBe(0)
  })

  it('never drops the lead HP below 1, and reports the real damage', () => {
    const start = createBattle()
    let state = {
      ...start,
      party: start.party.map((p, i) => (i === 0 ? { ...p, hp: 3 } : p)),
      team: start.team.map((p, i) => (i === 0 ? { ...p, hp: 1000 } : p)),
    }
    state = play(state, GIT)
    expect(texts(state)[1]).toContain('took 2 damage')
    expect(getLead(clearQueue(state)).hp).toBe(1)
    for (let turn = 0; turn < 5; turn++) state = play(state, GIT)
    expect(texts(state)[1]).toContain('took 0 damage')
    expect(getLead(clearQueue(state)).hp).toBe(1)
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
    expect(select(victory, 1)).toBe(victory)
  })
})

describe('changes appear with their messages', () => {
  it('drops the opponent HP with the move and the lead HP with the counterattack', () => {
    let state = play(createBattle(), REACT)
    expect(state.team[0].hp).toBe(20)
    expect(getLead(state).hp).toBe(60)
    state = advance(state)
    expect(getLead(state).hp).toBe(56)
  })

  it('keeps the fainted Pokémon on the field until the next one is sent out', () => {
    let state = play(play(createBattle(), REACT), REACT)
    expect(state.team[0].hp).toBe(0)
    expect(state.active).toBe(0)
    state = advance(state)
    expect(texts(state)[0]).toBe('SCREENMON fainted!')
    expect(state.active).toBe(0)
    state = advance(state)
    expect(texts(state)[0]).toBe('Recruiter sent out HIREMON!')
    expect(state.active).toBe(1)
  })

  it('ends up in the same state once every message has been read', () => {
    const state = clearQueue(play(createBattle(), REACT))
    expect(state.menu).toBe('main')
    expect(state.active).toBe(0)
    expect(state.team[0].hp).toBe(20)
    expect(getLead(state).hp).toBe(56)
  })
})

describe('rematch', () => {
  it('restores the starting state', () => {
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(select(victory, 0)).toEqual(createBattle())
  })
})
