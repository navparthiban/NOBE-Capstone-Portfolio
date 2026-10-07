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
    queue: [{ text: 'A Recruiter wants to battle!' }, { text: `Recruiter sent out ${team[0].name}!` }],
    player: { ...player, hp: player.maxHp },
    team,
    active: 0,
  }
}

function applyChanges(state, message) {
  return message?.changes ? { ...state, ...message.changes } : state
}

export function takeTurn(state, moveIndex) {
  const move = moves[moveIndex]
  if (state.menu !== 'fight' || !move) return state

  const target = state.team[state.active]
  const hp = Math.max(0, target.hp - move.damage)
  const team = state.team.map((pokemon, index) => (index === state.active ? { ...pokemon, hp } : pokemon))
  const queue = [{ text: move.message, changes: { team } }]
  const hasNext = state.active + 1 < team.length

  if (hp > 0) {
    const taken = Math.min(target.attack.damage, state.player.hp - 1)
    queue.push({
      text: `${target.name} used ${target.attack.name}! ${state.player.name} took ${taken} damage.`,
      changes: { player: { ...state.player, hp: state.player.hp - taken } },
    })
  } else if (hasNext) {
    queue.push(
      { text: `${target.name} fainted!` },
      { text: `Recruiter sent out ${team[state.active + 1].name}!`, changes: { active: state.active + 1 } },
    )
  } else {
    queue.push(
      { text: `${target.name} fainted!` },
      { text: 'Recruiter has no Pokémon left!' },
      { text: 'Navin won the battle!' },
    )
  }

  const menu = hp === 0 && !hasNext ? 'victory' : 'main'
  return applyChanges({ ...state, menu, cursor: 0, queue }, queue[0])
}

function selectOption(state, index) {
  const option = getMenuOptions(state.menu)[index]
  if (!option) return state

  if (state.menu === 'victory') return createBattle()
  if (state.menu === 'fight') {
    return option === 'BACK' ? { ...state, menu: 'main', cursor: 0 } : takeTurn(state, index)
  }
  if (option === 'FIGHT') return { ...state, menu: 'fight', cursor: 0 }
  return { ...state, cursor: index, queue: [{ text: getSelectionMessage(option) }] }
}

export function battleReducer(state, action) {
  if (action.type === 'advance') {
    const queue = state.queue.slice(1)
    return applyChanges({ ...state, queue }, queue[0])
  }
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
