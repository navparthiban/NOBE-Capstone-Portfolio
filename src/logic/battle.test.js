import { describe, expect, it } from 'vitest'
import { party } from '../data/party.js'
import {
  battleReducer,
  createBattle,
  getHpPercent,
  getLead,
  getMenuOptions,
  getPrompt,
  moveCursor,
  RUN_MESSAGE,
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

function recover(state) {
  let current = clearQueue(state)
  if (current.mustSwitch) {
    const index = current.party.findIndex((pokemon) => pokemon.hp > 0)
    current = clearQueue(select(select(current, index), 0))
  }
  return current
}

function openFight(state) {
  return select(recover(state), 0)
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

  it('returns the six party names and CANCEL for the party list', () => {
    expect(getMenuOptions('party')).toEqual([...party.map((pokemon) => pokemon.name), 'CANCEL'])
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

describe('moveCursor with the last option right-aligned', () => {
  const move = (index, key, columns = 2) => moveCursor(index, key, 7, columns, true)

  it('moves between neighboring cards in all four directions', () => {
    expect(move(0, 'ArrowRight')).toBe(1)
    expect(move(0, 'ArrowDown')).toBe(2)
    expect(move(3, 'ArrowLeft')).toBe(2)
    expect(move(3, 'ArrowUp')).toBe(1)
    expect(move(3, 'ArrowDown')).toBe(5)
  })

  it('reaches the last option from the bottom row, and comes back up to the right-hand card', () => {
    expect(move(5, 'ArrowDown')).toBe(6)
    expect(move(4, 'ArrowDown')).toBe(6)
    expect(move(6, 'ArrowUp')).toBe(5)
  })

  it('stays put at the edges of the grid', () => {
    expect(move(0, 'ArrowUp')).toBe(0)
    expect(move(1, 'ArrowUp')).toBe(1)
    expect(move(0, 'ArrowLeft')).toBe(0)
    expect(move(2, 'ArrowLeft')).toBe(2)
    expect(move(1, 'ArrowRight')).toBe(1)
    expect(move(5, 'ArrowRight')).toBe(5)
  })

  it('stays put on the last option when moving left, right, or down', () => {
    expect(move(6, 'ArrowLeft')).toBe(6)
    expect(move(6, 'ArrowRight')).toBe(6)
    expect(move(6, 'ArrowDown')).toBe(6)
  })

  it('keeps the cursor inside the list however many keys are pressed', () => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'a']
    for (let start = 0; start < 7; start++) {
      let index = start
      for (let step = 0; step < 40; step++) {
        index = move(index, keys[(step * 7 + start) % keys.length])
        expect(index).toBeGreaterThanOrEqual(0)
        expect(index).toBeLessThanOrEqual(6)
      }
    }
  })

  it('moves one card at a time in a single column', () => {
    expect(move(0, 'ArrowDown', 1)).toBe(1)
    expect(move(5, 'ArrowDown', 1)).toBe(6)
    expect(move(6, 'ArrowUp', 1)).toBe(5)
    expect(move(2, 'ArrowRight', 1)).toBe(2)
    expect(move(2, 'ArrowLeft', 1)).toBe(2)
  })

  it('leaves the main menu movement unchanged when the flag is off', () => {
    expect(moveCursor(2, 'ArrowRight', 3, 2, false)).toBe(2)
    expect(moveCursor(1, 'ArrowDown', 3, 2, false)).toBe(1)
    expect(moveCursor(2, 'ArrowDown', 5, 2, false)).toBe(4)
  })
})

describe('RUN', () => {
  const runOption = 3

  it('queues "Got away safely!" and marks it as the way out to the portfolio', () => {
    const state = select(clearQueue(createBattle()), runOption)
    expect(state.queue).toEqual([{ text: 'Got away safely!', exit: 'portfolio' }])
    expect(RUN_MESSAGE).toBe('Got away safely!')
  })

  it('changes nothing else, so the battle comes back exactly as it was, with the cursor on RUN', () => {
    const before = clearQueue(createBattle())
    const after = clearQueue(select(before, runOption))
    expect(after).toEqual({ ...before, cursor: runOption })
    expect(after.menu).toBe('main')
    expect(getLead(after).hp).toBe(60)
  })

  it('keeps HP and the active Pokémon after RUN, mid-battle', () => {
    let state = clearQueue(play(createBattle(), REACT))
    state = clearQueue(select(select(select(state, PARTY_OPTION), 2), 0))
    const before = state
    const after = clearQueue(select(before, runOption))
    expect(after.party).toEqual(before.party)
    expect(after.team).toEqual(before.team)
    expect(after.lead).toBe(2)
    expect(after.active).toBe(before.active)
    expect(after.fx).toEqual(before.fx)
  })

  it('does nothing while a message is still showing', () => {
    const state = select(clearQueue(createBattle()), runOption)
    expect(select(state, 0)).toBe(state)
  })

  it('is the only message with an exit', () => {
    const state = createBattle()
    expect(state.queue.every((message) => message.exit === undefined)).toBe(true)
    expect(select(clearQueue(createBattle()), 0).queue).toEqual([])
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
    expect(texts(state)).toEqual([
      'A Recruiter wants to battle!',
      'Recruiter sent out SCREENMON!',
      'Go, PORYGON!',
    ])
  })

  it('starts with both sides off the field and sends each out with its own message', () => {
    let state = createBattle()
    expect(state.fx).toEqual({ player: 'hidden', opponent: 'hidden' })
    state = advance(state)
    expect(texts(state)[0]).toBe('Recruiter sent out SCREENMON!')
    expect(state.fx).toEqual({ player: 'hidden', opponent: 'sendout' })
    state = advance(state)
    expect(texts(state)[0]).toBe('Go, PORYGON!')
    expect(state.fx).toEqual({ player: 'sendout', opponent: 'sendout' })
    expect(clearQueue(state).fx).toEqual({ player: 'sendout', opponent: 'sendout' })
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
    expect(texts(state)).toEqual(['Recruiter sent out SCREENMON!', 'Go, PORYGON!'])
    state = advance(advance(state))
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

describe('bag', () => {
  const BAG_OPTION = 1
  const openBag = (state) => select(clearQueue(state), BAG_OPTION)
  const press = (state, key) => battleReducer(state, { type: 'cursor', key })

  it('lists the four items and CANCEL', () => {
    expect(getMenuOptions('bag')).toEqual(['RESUME', 'GITHUB', 'LINKEDIN', 'EMAIL', 'CANCEL'])
  })

  it('opens the bag from the main menu with the cursor on the first item', () => {
    const state = openBag(createBattle())
    expect(state.menu).toBe('bag')
    expect(state.cursor).toBe(0)
    expect(state.queue).toEqual([])
  })

  it('moves through one column and stops at both edges', () => {
    let state = openBag(createBattle())
    state = press(state, 'ArrowUp')
    expect(state.cursor).toBe(0)
    for (let i = 0; i < 6; i++) state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(4)
    state = press(state, 'ArrowRight')
    state = press(state, 'ArrowLeft')
    expect(state.cursor).toBe(4)
  })

  it('returns to the main menu with the cursor on BAG using Escape', () => {
    const state = battleReducer(press(openBag(createBattle()), 'ArrowDown'), { type: 'back' })
    expect(state.menu).toBe('main')
    expect(state.cursor).toBe(BAG_OPTION)
  })

  it('returns to the main menu with the cursor on BAG using CANCEL', () => {
    const state = select(openBag(createBattle()), 4)
    expect(state.menu).toBe('main')
    expect(state.cursor).toBe(BAG_OPTION)
  })

  it('keeps the bag open when an item is selected', () => {
    const state = select(openBag(createBattle()), 2)
    expect(state.menu).toBe('bag')
    expect(state.cursor).toBe(2)
    expect(state.queue).toEqual([])
  })
})

describe('party', () => {
  it('opens the party list when PARTY is selected', () => {
    const state = openParty(createBattle())
    expect(state.menu).toBe('party')
    expect(state.cursor).toBe(0)
    expect(state.queue).toEqual([])
  })

  it('opens the small menu for the selected Pokémon', () => {
    const state = select(openParty(createBattle()), 2)
    expect(state.menu).toBe('partyMenu')
    expect(state.selected).toBe(2)
    expect(party[state.selected].name).toBe('ALAKAZAM')
    expect(getMenuOptions(state.menu)).toEqual(['SWITCH', 'SUMMARY', 'CANCEL'])
  })

  it('opens the matching summary from SUMMARY', () => {
    const state = select(select(openParty(createBattle()), 2), 1)
    expect(state.menu).toBe('summary')
    expect(state.selected).toBe(2)
    expect(getMenuOptions(state.menu)).toEqual(['BACK'])
  })

  it('selects with the cursor when no index is given', () => {
    let state = openParty(createBattle())
    state = battleReducer(state, { type: 'cursor', key: 'ArrowRight' })
    state = battleReducer(state, { type: 'select' })
    expect(state.menu).toBe('partyMenu')
    expect(state.selected).toBe(1)
  })

  it('goes from the summary back to the list with the cursor on that Pokémon', () => {
    const summary = select(select(openParty(createBattle()), 3), 1)
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

  it('moves through the grid and reaches CANCEL', () => {
    const press = (state, key, columns) => battleReducer(state, { type: 'cursor', key, columns })
    let state = openParty(createBattle())
    state = press(state, 'ArrowRight')
    expect(state.cursor).toBe(1)
    state = press(state, 'ArrowDown')
    state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(5)
    state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(6)
    state = press(state, 'ArrowUp')
    expect(state.cursor).toBe(5)
  })

  it('does not break the cursor when pressing arrows at the edge of the grid', () => {
    const press = (state, key) => battleReducer(state, { type: 'cursor', key })
    let state = openParty(createBattle())
    state = press(press(state, 'ArrowUp'), 'ArrowLeft')
    expect(state.cursor).toBe(0)
    expect(state.menu).toBe('party')
    state = press(state, 'ArrowRight')
    state = press(state, 'ArrowRight')
    expect(state.cursor).toBe(1)
    for (let step = 0; step < 6; step++) state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(6)
    for (const key of ['ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home']) state = press(state, key)
    expect(state.cursor).toBe(6)
    expect(state.menu).toBe('party')
  })

  it('moves one card at a time when the screen is one column wide', () => {
    const press = (state, key) => battleReducer(state, { type: 'cursor', key, columns: 1 })
    let state = openParty(createBattle())
    state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(1)
    state = press(state, 'ArrowRight')
    expect(state.cursor).toBe(1)
    state = press(press(press(press(press(state, 'ArrowDown'), 'ArrowDown'), 'ArrowDown'), 'ArrowDown'), 'ArrowDown')
    expect(state.cursor).toBe(6)
    expect(press(state, 'ArrowDown').cursor).toBe(6)
  })

  it('selects CANCEL with the cursor to go back to the main menu', () => {
    let state = openParty(createBattle())
    for (let step = 0; step < 4; step++) state = battleReducer(state, { type: 'cursor', key: 'ArrowDown' })
    expect(state.cursor).toBe(6)
    state = battleReducer(state, { type: 'select' })
    expect(state.menu).toBe('main')
    expect(state.cursor).toBe(PARTY_OPTION)
  })

  it('does nothing for a Pokémon that does not exist', () => {
    const list = openParty(createBattle())
    expect(select(list, 99)).toBe(list)
  })

  it('shows lowered HP for the lead after a counterattack and full HP for the rest', () => {
    const state = clearQueue(play(createBattle(), REACT))
    expect(state.party[0].hp).toBe(50)
    expect(state.party.slice(1).every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true)
  })

  it('resets the party and selection on rematch', () => {
    const summary = select(openParty(createBattle()), 4)
    expect(summary.selected).toBe(4)
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(select(victory, 0)).toEqual(createBattle())
  })
})

describe('switching', () => {
  const ALAKAZAM = 2
  const openMenu = (state, index) => select(openParty(state), index)
  const switchTo = (state, index) => select(openMenu(state, index), 0)
  const press = (state, key) => battleReducer(state, { type: 'cursor', key })

  it('moves through the small menu and stops at the edges', () => {
    let state = openMenu(createBattle(), ALAKAZAM)
    expect(state.cursor).toBe(0)
    state = press(press(state, 'ArrowUp'), 'ArrowLeft')
    expect(state.cursor).toBe(0)
    for (let i = 0; i < 4; i++) state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(2)
    expect(press(state, 'ArrowRight').cursor).toBe(2)
  })

  it('goes back to the party list with CANCEL or Escape, on the same Pokémon', () => {
    const menu = openMenu(createBattle(), ALAKAZAM)
    for (const state of [select(menu, 2), battleReducer(menu, { type: 'back' })]) {
      expect(state.menu).toBe('party')
      expect(state.cursor).toBe(ALAKAZAM)
    }
  })

  it('changes the lead and shows the recall and send-out messages in order', () => {
    const state = switchTo(clearQueue(createBattle()), ALAKAZAM)
    expect(state.menu).toBe('main')
    expect(texts(state)[0]).toBe('Come back, PORYGON!')
    expect(texts(state)[1]).toBe('Go, ALAKAZAM!')
    expect(getLead(clearQueue(state)).name).toBe('ALAKAZAM')
  })

  it('keeps the old lead on the field until the send-out message appears', () => {
    let state = switchTo(clearQueue(createBattle()), ALAKAZAM)
    expect(getLead(state).name).toBe('PORYGON')
    expect(state.fx.player).toBe('recall')
    state = advance(state)
    expect(texts(state)[0]).toBe('Go, ALAKAZAM!')
    expect(getLead(state).name).toBe('ALAKAZAM')
    expect(state.fx.player).toBe('sendout')
  })

  it('has the Recruiter attack the new Pokémon after it is out', () => {
    let state = switchTo(clearQueue(createBattle()), ALAKAZAM)
    expect(texts(state)).toHaveLength(3)
    expect(texts(state)[2]).toBe('SCREENMON used Interview! ALAKAZAM took 10 damage.')
    state = advance(advance(state))
    expect(getLead(state).hp).toBe(45)
    expect(state.party[0].hp).toBe(60)
  })

  it('uses up the turn without damaging the Recruiter', () => {
    const state = clearQueue(switchTo(clearQueue(createBattle()), ALAKAZAM))
    expect(state.team.map((pokemon) => pokemon.hp)).toEqual([40, 50, 60])
    expect(state.menu).toBe('main')
    expect(state.cursor).toBe(0)
  })

  it("keeps each Pokémon's own HP when switching away and back", () => {
    let state = clearQueue(play(createBattle(), REACT))
    expect(state.party[0].hp).toBe(50)
    state = clearQueue(switchTo(state, ALAKAZAM))
    expect(state.party[0].hp).toBe(50)
    expect(state.party[ALAKAZAM].hp).toBe(45)
    state = clearQueue(switchTo(state, 0))
    expect(getLead(state).name).toBe('PORYGON')
    expect(getLead(state).hp).toBe(40)
    expect(state.party[ALAKAZAM].hp).toBe(45)
  })

  it('fights with the same four moves whichever Pokémon is out', () => {
    const state = clearQueue(switchTo(clearQueue(createBattle()), ALAKAZAM))
    expect(getMenuOptions('fight')).toEqual(['React', 'TypeScript', 'Java', 'Git', 'BACK'])
    const after = play(state, GIT)
    expect(after.team[0].hp).toBe(30)
    expect(texts(after)[1]).toContain('ALAKAZAM took')
  })

  it('only shows a message when switching to the Pokémon already in battle', () => {
    const state = clearQueue(createBattle())
    const result = switchTo(state, 0)
    expect(texts(result)).toEqual(['PORYGON is already in battle!'])
    expect(result.lead).toBe(0)
    expect(result.party).toEqual(state.party)
    expect(result.team).toEqual(state.team)
    expect(clearQueue(result).menu).toBe('party')
    expect(clearQueue(result).cursor).toBe(0)
  })

  it('ignores the menu while a message is showing', () => {
    const result = switchTo(clearQueue(createBattle()), ALAKAZAM)
    expect(select(result, 0)).toBe(result)
  })

  it('blocks switching after victory', () => {
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(victory.menu).toBe('victory')
    const forced = { ...victory, menu: 'partyMenu', selected: ALAKAZAM }
    expect(battleReducer(forced, { type: 'select', index: 0 })).toBe(forced)
    expect(getMenuOptions('victory')).toEqual(['REMATCH'])
  })

  it('resets all HP, the lead, and the animations on rematch', () => {
    let state = clearQueue(switchTo(clearQueue(createBattle()), ALAKAZAM))
    state = clearQueue(playUntilVictory(state, REACT))
    const rematch = select(state, 0)
    expect(rematch).toEqual(createBattle())
    expect(rematch.lead).toBe(0)
    expect(rematch.party.every((pokemon) => pokemon.hp === pokemon.maxHp)).toBe(true)
    expect(rematch.fx).toEqual({ player: 'hidden', opponent: 'hidden' })
    expect(texts(rematch)[0]).toBe('A Recruiter wants to battle!')
  })

  it("does not put the Recruiter's next Pokémon on the field until its send-out message", () => {
    let turn = play(clearQueue(play(clearQueue(createBattle()), REACT)), REACT)
    const seen = []
    while (turn.queue.length > 0) {
      seen.push({ text: turn.queue[0].text, active: turn.active, fx: turn.fx.opponent })
      turn = advance(turn)
    }
    const sendOut = seen.findIndex((entry) => entry.text === 'Recruiter sent out HIREMON!')
    expect(sendOut).toBeGreaterThan(0)
    expect(seen[sendOut]).toMatchObject({ active: 1, fx: 'sendout' })
    for (const entry of seen.slice(0, sendOut)) expect(entry.active).toBe(0)
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
    expect(texts(state)[1]).toBe('SCREENMON used Interview! PORYGON took 10 damage.')
    expect(getLead(clearQueue(state)).hp).toBe(50)
  })

  it('sends out the next Pokémon when one faints, without a counterattack', () => {
    let state = play(createBattle(), REACT)
    state = play(state, REACT)
    expect(state.team[0].hp).toBe(0)
    expect(getLead(state).hp).toBe(50)
    expect(texts(state)).toEqual([
      'Navin used React! It built the frontend.',
      'SCREENMON fainted!',
      'Recruiter sent out HIREMON!',
    ])
    const finished = clearQueue(state)
    expect(finished.active).toBe(1)
    expect(getLead(finished).hp).toBe(50)
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

  it('never drops the last Pokémon able to fight below 1 HP, and reports the real damage', () => {
    const start = createBattle()
    let state = {
      ...start,
      party: start.party.map((p, i) => ({ ...p, hp: i === 0 ? 3 : 0 })),
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
    expect(getLead(state).hp).toBe(50)
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
    expect(getLead(state).hp).toBe(50)
  })
})

describe('fainting and forced switching', () => {
  const ALAKAZAM = 2
  const press = (state, key) => battleReducer(state, { type: 'cursor', key })
  const withHp = (state, hps) => ({
    ...state,
    party: state.party.map((pokemon, i) => (i in hps ? { ...pokemon, hp: hps[i] } : pokemon)),
  })
  const faintedLead = () => play(withHp(clearQueue(createBattle()), { 0: 5 }), REACT)
  const forcedParty = () => clearQueue(faintedLead())

  it('lets a Pokémon faint when others can still fight, with the faint message last', () => {
    const state = faintedLead()
    expect(texts(state)).toEqual([
      'Navin used React! It built the frontend.',
      'SCREENMON used Interview! PORYGON took 5 damage.',
      'PORYGON fainted!',
    ])
  })

  it('applies the faint only when its message appears', () => {
    let state = faintedLead()
    expect(state.mustSwitch).toBe(false)
    expect(state.fx.player).toBe('sendout')
    state = advance(state)
    expect(state.party[0].hp).toBe(0)
    expect(state.mustSwitch).toBe(false)
    state = advance(state)
    expect(texts(state)[0]).toBe('PORYGON fainted!')
    expect(state.mustSwitch).toBe(true)
    expect(state.fx.player).toBe('faint')
    expect(state.menu).toBe('main')
  })

  it('opens the party by itself once the messages are read, on the first Pokémon able to fight', () => {
    const state = forcedParty()
    expect(state.menu).toBe('party')
    expect(state.mustSwitch).toBe(true)
    expect(state.cursor).toBe(1)
    expect(state.queue).toEqual([])
  })

  it('does not let the visitor leave the party with Escape or CANCEL', () => {
    const state = forcedParty()
    expect(battleReducer(state, { type: 'back' })).toBe(state)
    expect(select(state, 6)).toBe(state)
  })

  it('keeps the cursor on the Pokémon, never on CANCEL', () => {
    let state = forcedParty()
    for (let i = 0; i < 6; i++) state = press(state, 'ArrowDown')
    expect(state.cursor).toBe(5)
    expect(press(press(state, 'ArrowRight'), 'ArrowDown').cursor).toBe(5)
  })

  it('still opens the small menu and the summary for a Pokémon while forced', () => {
    const menu = select(forcedParty(), ALAKAZAM)
    expect(menu.menu).toBe('partyMenu')
    const summary = select(menu, 1)
    expect(summary.menu).toBe('summary')
    const back = battleReducer(summary, { type: 'back' })
    expect(back.menu).toBe('party')
    expect(back.mustSwitch).toBe(true)
    expect(battleReducer(menu, { type: 'back' }).menu).toBe('party')
  })

  it('sends out the chosen Pokémon without a recall or a Recruiter attack', () => {
    const forced = forcedParty()
    const state = select(select(forced, ALAKAZAM), 0)
    expect(texts(state)).toEqual(['Go, ALAKAZAM!'])
    const done = clearQueue(state)
    expect(done.menu).toBe('main')
    expect(done.mustSwitch).toBe(false)
    expect(done.lead).toBe(ALAKAZAM)
    expect(done.fx.player).toBe('sendout')
    expect(done.party[ALAKAZAM].hp).toBe(55)
    expect(done.team).toEqual(forced.team)
  })

  it('does not let the visitor pick a Pokémon that has fainted', () => {
    const forced = forcedParty()
    const state = select(select(forced, 0), 0)
    expect(texts(state)).toEqual(['PORYGON has no energy left!'])
    const done = clearQueue(state)
    expect(done.menu).toBe('party')
    expect(done.mustSwitch).toBe(true)
    expect(done.lead).toBe(0)
    expect(done.cursor).toBe(0)
  })

  it('blocks a voluntary switch to a fainted Pokémon without a Recruiter attack', () => {
    const base = withHp(clearQueue(createBattle()), { 3: 0 })
    const state = select(select(openParty(base), 3), 0)
    expect(texts(state)).toEqual(['MEOWTH has no energy left!'])
    const done = clearQueue(state)
    expect(done.lead).toBe(0)
    expect(done.party[0].hp).toBe(60)
    expect(done.team).toEqual(base.team)
  })

  it('keeps a fainted Pokémon at 0 HP after the party changes', () => {
    const state = clearQueue(select(select(forcedParty(), ALAKAZAM), 0))
    expect(state.party[0].hp).toBe(0)
    expect(state.party.slice(1).every((pokemon) => pokemon.hp > 0)).toBe(true)
  })

  it('lets the new Pokémon faint too when a switch puts it in front of the counterattack', () => {
    const base = withHp(clearQueue(createBattle()), { [ALAKAZAM]: 5 })
    const state = select(select(openParty(base), ALAKAZAM), 0)
    expect(texts(state)).toEqual([
      'Come back, PORYGON!',
      'Go, ALAKAZAM!',
      'SCREENMON used Interview! ALAKAZAM took 5 damage.',
      'ALAKAZAM fainted!',
    ])
    const done = clearQueue(state)
    expect(done.menu).toBe('party')
    expect(done.mustSwitch).toBe(true)
    expect(done.party[ALAKAZAM].hp).toBe(0)
  })

  it('never faints the last Pokémon able to fight, so the visitor cannot lose', () => {
    const base = clearQueue(createBattle())
    const alone = withHp(base, { 0: 3, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
    const state = play(alone, GIT)
    expect(texts(state)[1]).toBe('SCREENMON used Interview! PORYGON took 2 damage.')
    expect(texts(state)).toHaveLength(2)
    const done = clearQueue(state)
    expect(done.party[0].hp).toBe(1)
    expect(done.mustSwitch).toBe(false)
    expect(done.menu).toBe('main')
  })

  it('still ends in victory in a long battle that needs forced switches', () => {
    const state = playUntilVictory(createBattle(), GIT)
    expect(state.menu).toBe('victory')
    expect(state.party.some((pokemon) => pokemon.hp === 0)).toBe(true)
    expect(state.party.some((pokemon) => pokemon.hp > 0)).toBe(true)
  })

  it('resets the forced switch and every HP on rematch', () => {
    const rematch = select(clearQueue(playUntilVictory(createBattle(), GIT)), 0)
    expect(rematch).toEqual(createBattle())
    expect(rematch.mustSwitch).toBe(false)
  })
})

describe('rematch', () => {
  it('restores the starting state', () => {
    const victory = clearQueue(playUntilVictory(createBattle(), REACT))
    expect(select(victory, 0)).toEqual(createBattle())
  })
})
