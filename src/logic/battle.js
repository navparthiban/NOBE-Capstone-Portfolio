import { bagItems } from '../data/bag.js'
import { moves } from '../data/moves.js'
import { party } from '../data/party.js'
import { recruiterTeam } from '../data/pokemon.js'

export const MENU_COLUMNS = 2

const MAIN_OPTIONS = ['FIGHT', 'BAG', 'PARTY', 'RUN']

export function getMenuOptions(menu = 'main') {
  if (menu === 'fight') return [...moves.map((move) => move.name), 'BACK']
  if (menu === 'party') return [...party.map((pokemon) => pokemon.name), 'CANCEL']
  if (menu === 'partyMenu') return ['SWITCH', 'SUMMARY', 'CANCEL']
  if (menu === 'bag') return [...bagItems.map((item) => item.name), 'CANCEL']
  if (menu === 'summary') return ['BACK']
  if (menu === 'victory') return ['REMATCH']
  return MAIN_OPTIONS
}

export const PARTY_COLUMNS = 2

function getGrid(menu, columns) {
  if (menu === 'party') return { columns: columns ?? PARTY_COLUMNS, rightAlignLast: true }
  if (menu === 'summary' || menu === 'bag' || menu === 'partyMenu') return { columns: 1, rightAlignLast: false }
  return { columns: MENU_COLUMNS, rightAlignLast: false }
}

export function moveCursor(
  index,
  key,
  count = MAIN_OPTIONS.length,
  columns = MENU_COLUMNS,
  rightAlignLast = false,
) {
  const last = count - 1
  const lastCell = rightAlignLast ? last + (columns - 1 - (last % columns)) : last
  const cell = index === last ? lastCell : index
  const column = cell % columns
  const nextCell = {
    ArrowLeft: column > 0 ? cell - 1 : cell,
    ArrowRight: column < columns - 1 && cell + 1 <= lastCell ? cell + 1 : cell,
    ArrowUp: cell - columns >= 0 ? cell - columns : cell,
    ArrowDown: cell + columns <= lastCell ? cell + columns : cell,
  }[key]
  if (nextCell === undefined) return index
  return Math.min(nextCell, last)
}

export function getSelectionMessage(option) {
  return `Navin wants to ${option}!`
}

export function getHpPercent(hp, maxHp) {
  if (maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (hp / maxHp) * 100))
}

export function getLead(state) {
  return state.party[state.lead]
}

export function getPrompt(state) {
  if (state.menu === 'fight') return 'Choose a move.'
  if (state.menu === 'victory') return 'Want to battle again?'
  return `What will ${getLead(state).name} do?`
}

export function createBattle() {
  const team = recruiterTeam.map((pokemon) => ({ ...pokemon, hp: pokemon.maxHp }))
  const leadPokemon = party[0]
  return {
    menu: 'main',
    cursor: 0,
    queue: [
      { text: 'A Recruiter wants to battle!' },
      {
        text: `Recruiter sent out ${team[0].name}!`,
        changes: { fx: { player: 'hidden', opponent: 'sendout' } },
      },
      { text: `Go, ${leadPokemon.name}!`, changes: { fx: { player: 'sendout', opponent: 'sendout' } } },
    ],
    party: party.map((pokemon) => ({ ...pokemon, hp: pokemon.maxHp })),
    lead: 0,
    selected: 0,
    team,
    active: 0,
    fx: { player: 'hidden', opponent: 'hidden' },
  }
}

export function isOver(state) {
  return state.team.every((pokemon) => pokemon.hp === 0)
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
    const lead = getLead(state)
    const taken = Math.min(target.attack.damage, lead.hp - 1)
    const updated = state.party.map((pokemon, index) =>
      index === state.lead ? { ...pokemon, hp: pokemon.hp - taken } : pokemon,
    )
    queue.push({
      text: `${target.name} used ${target.attack.name}! ${lead.name} took ${taken} damage.`,
      changes: { party: updated },
    })
  } else if (hasNext) {
    queue.push(
      { text: `${target.name} fainted!` },
      {
        text: `Recruiter sent out ${team[state.active + 1].name}!`,
        changes: { active: state.active + 1, fx: { ...state.fx, opponent: 'sendout' } },
      },
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

export function switchLead(state, index) {
  const next = state.party[index]
  if (state.menu !== 'partyMenu' || !next || isOver(state)) return state

  if (index === state.lead) {
    return { ...state, menu: 'party', cursor: index, queue: [{ text: `${next.name} is already in battle!` }] }
  }

  const current = getLead(state)
  const attacker = state.team[state.active]
  const taken = Math.min(attacker.attack.damage, next.hp - 1)
  const updated = state.party.map((pokemon, i) => (i === index ? { ...pokemon, hp: pokemon.hp - taken } : pokemon))
  const queue = [
    { text: `Come back, ${current.name}!`, changes: { fx: { ...state.fx, player: 'recall' } } },
    { text: `Go, ${next.name}!`, changes: { lead: index, fx: { ...state.fx, player: 'sendout' } } },
    { text: `${attacker.name} used ${attacker.attack.name}! ${next.name} took ${taken} damage.`, changes: { party: updated } },
  ]
  return applyChanges({ ...state, menu: 'main', cursor: 0, queue }, queue[0])
}

function goBack(state) {
  if (state.menu === 'partyMenu') return { ...state, menu: 'party', cursor: state.selected }
  if (state.menu === 'fight') return { ...state, menu: 'main', cursor: 0 }
  if (state.menu === 'party') return { ...state, menu: 'main', cursor: MAIN_OPTIONS.indexOf('PARTY') }
  if (state.menu === 'summary') return { ...state, menu: 'party', cursor: state.selected }
  if (state.menu === 'bag') return { ...state, menu: 'main', cursor: MAIN_OPTIONS.indexOf('BAG') }
  return state
}

function selectOption(state, index) {
  const option = getMenuOptions(state.menu)[index]
  if (!option) return state

  if (state.menu === 'victory') return createBattle()
  if (option === 'BACK' || option === 'CANCEL') return goBack(state)
  if (state.menu === 'fight') return takeTurn(state, index)
  if (state.menu === 'party') return { ...state, menu: 'partyMenu', selected: index, cursor: 0 }
  if (state.menu === 'partyMenu') {
    return option === 'SWITCH' ? switchLead(state, state.selected) : { ...state, menu: 'summary', cursor: 0 }
  }
  if (state.menu === 'bag') return { ...state, cursor: index }
  if (option === 'FIGHT') return { ...state, menu: 'fight', cursor: 0 }
  if (option === 'BAG') return { ...state, menu: 'bag', cursor: 0 }
  if (option === 'PARTY') return { ...state, menu: 'party', cursor: 0 }
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
      const { columns, rightAlignLast } = getGrid(state.menu, action.columns)
      return { ...state, cursor: moveCursor(state.cursor, action.key, count, columns, rightAlignLast) }
    }
    case 'back':
      return goBack(state)
    case 'select':
      return selectOption(state, action.index ?? state.cursor)
    default:
      return state
  }
}
