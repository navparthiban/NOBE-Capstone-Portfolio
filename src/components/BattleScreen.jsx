import { useReducer } from 'react'
import { useFrame } from '../hooks/useFrame.js'
import { PARTY_COLUMNS, battleReducer, createBattle, getLead, getPrompt } from '../logic/battle.js'
import BattleMenu from './BattleMenu.jsx'
import PartyScreen from './PartyScreen.jsx'
import PartySummary from './PartySummary.jsx'
import PokemonStatus from './PokemonStatus.jsx'
import Sprite from './Sprite.jsx'
import TextBox from './TextBox.jsx'
import './BattleScreen.css'

export default function BattleScreen() {
  const [state, dispatch] = useReducer(battleReducer, null, createBattle)
  const hasMessages = state.queue.length > 0
  const opponent = state.team[state.active]
  const lead = getLead(state)
  const message = hasMessages ? state.queue[0].text : getPrompt(state)
  const { orientation } = useFrame()

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      dispatch({ type: 'back' })
    } else if (event.key.startsWith('Arrow')) {
      event.preventDefault()
      dispatch({ type: 'cursor', key: event.key, columns: orientation === 'portrait' ? 1 : PARTY_COLUMNS })
    }
  }

  const handleSelect = (index) => dispatch({ type: 'select', index })

  return (
    <main className="battle">
      <h1 className="visually-hidden">Navin's Portfolio</h1>
      {state.menu === 'party' && (
        <PartyScreen
          party={state.party}
          cursor={state.cursor}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
        />
      )}
      {state.menu === 'summary' && (
        <PartySummary
          pokemon={state.party[state.selected]}
          cursor={state.cursor}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
        />
      )}
      {state.menu !== 'party' && state.menu !== 'summary' && (
        <>
          <section className="field">
            <PokemonStatus key={opponent.name} pokemon={opponent} side="opponent" />
            <Sprite name={opponent.name} src={opponent.sprite} side="opponent" />
            <Sprite name={lead.name} src={lead.sprite} side="player" />
            <PokemonStatus pokemon={lead} side="player" />
          </section>
          <section className={hasMessages ? 'panel panel--full' : 'panel'}>
            <TextBox
              message={message}
              interactive={hasMessages}
              onAdvance={() => dispatch({ type: 'advance' })}
            />
            {!hasMessages && (
              <BattleMenu
                menu={state.menu}
                cursor={state.cursor}
                onKeyDown={handleKeyDown}
                onSelect={handleSelect}
              />
            )}
          </section>
        </>
      )}
    </main>
  )
}
