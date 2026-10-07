import { moves } from '../data/moves.js'
import { player, recruiterTeam } from '../data/pokemon.js'

export const MENU_COLUMNS = 2

const MAIN_OPTIONS = ['FIGHT', 'BAG', 'PARTY', 'RUN']

export function getMenuOptions(menu = 'main') {
  if (menu === 'fight') return [...moves.map((move) => move.name), 'BACK']
  if (menu === 'victory') return ['REMATCH']
  return MAIN_OPTIONS
}

export function moveCursor(index, key, count = MAIN_OPTIONS.length, columns = MENU_COLUMNS) {
  const column = index % columns
  const nextIndex = {
    ArrowLeft: column > 0 ? index - 1 : index,
    ArrowRight: column < columns - 1 && index + 1 < count ? index + 1 : index,
    ArrowUp: index - columns >= 0 ? index - columns : index,
    ArrowDown: index + columns < count ? index + columns : index,
  }
  return nextIndex[key] ?? index
}

export function getSelectionMessage(option) {
  return `Navin wants to ${option}!`
}

export function getHpPercent(hp, maxHp) {
  if (maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (hp / maxHp) * 100))
}

export function getPrompt(state) {
  if (state.menu === 'fight') return 'Choose a move.'
  if (state.menu === 'victory') return 'Want to battle again?'
  return `What will ${state.player.name} do?`
}

export function createBattle() {
  const team = recruiterTeam.map((pokemon) => ({ ...pokemon, hp: pokemon.maxHp }))
  return {
    menu: 'main',
    cursor: 0,
    queue: ['A Recruiter wants to battle!', `Recruiter sent out ${team[0].name}!`],
    player: { ...player, hp: player.maxHp },
    team,
    active: 0,
  }
}

export function takeTurn(state, moveIndex) {
  const move = moves[moveIndex]
  if (state.menu !== 'fight' || !move) return state

  const team = state.team.map((pokemon, index) =>
    index === state.active ? { ...pokemon, hp: Math.max(0, pokemon.hp - move.damage) } : pokemon,
  )
  const target = team[state.active]
  const queue = [move.message]
  const next = { ...state, team, menu: 'main', cursor: 0, queue }

  if (target.hp > 0) {
    const taken = Math.min(target.attack.damage, state.player.hp - 1)
    queue.push(`${target.name} used ${target.attack.name}! ${state.player.name} took ${taken} damage.`)
    return { ...next, player: { ...state.player, hp: state.player.hp - taken } }
  }

  queue.push(`${target.name} fainted!`)
  if (state.active + 1 < team.length) {
    queue.push(`Recruiter sent out ${team[state.active + 1].name}!`)
    return { ...next, active: state.active + 1 }
  }

  queue.push('Recruiter has no Pokémon left!', 'Navin won the battle!')
  return { ...next, menu: 'victory' }
}

function selectOption(state, index) {
  const option = getMenuOptions(state.menu)[index]
  if (!option) return state

  if (state.menu === 'victory') return createBattle()
  if (state.menu === 'fight') {
    return option === 'BACK' ? { ...state, menu: 'main', cursor: 0 } : takeTurn(state, index)
  }
  if (option === 'FIGHT') return { ...state, menu: 'fight', cursor: 0 }
  return { ...state, cursor: index, queue: [getSelectionMessage(option)] }
}

export function battleReducer(state, action) {
  if (action.type === 'advance') return { ...state, queue: state.queue.slice(1) }
  if (state.queue.length > 0) return state

  switch (action.type) {
    case 'cursor': {
      const count = getMenuOptions(state.menu).length
      return { ...state, cursor: moveCursor(state.cursor, action.key, count) }
    }
    case 'back':
      return state.menu === 'fight' ? { ...state, menu: 'main', cursor: 0 } : state
    case 'select':
      return selectOption(state, action.index ?? state.cursor)
    default:
      return state
  }
}
