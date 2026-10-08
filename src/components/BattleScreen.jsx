import { useReducer } from 'react'
import { useFrame } from '../hooks/useFrame.js'
import { PARTY_COLUMNS, battleReducer, createBattle, getLead, getPrompt } from '../logic/battle.js'
import BagScreen from './BagScreen.jsx'
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
  const opponentOut = state.fx.opponent !== 'hidden'
  const playerOut = state.fx.player !== 'hidden'
  const playerFainted = state.fx.player === 'faint'
  const onField = !['party', 'partyMenu', 'summary', 'bag'].includes(state.menu)

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
      <section className={onField ? 'field' : 'field field--away'} aria-hidden={!onField} inert={!onField}>
        {opponentOut && <PokemonStatus key={opponent.name} pokemon={opponent} side="opponent" />}
        {opponentOut && (
          <Sprite
            key={`${opponent.name}-${state.fx.opponent}`}
            name={opponent.name}
            src={opponent.sprite}
            side="opponent"
            fx={state.fx.opponent}
          />
        )}
        {playerOut && (
          <Sprite
            key={`${lead.name}-${state.fx.player}`}
            name={lead.name}
            src={lead.sprite}
            side="player"
            fx={state.fx.player}
          />
        )}
        {playerOut && !playerFainted && <PokemonStatus key={lead.name} pokemon={lead} side="player" showNumbers />}
      </section>
      {(state.menu === 'party' || state.menu === 'partyMenu') && (
        <PartyScreen
          party={state.party}
          menu={state.menu}
          forced={state.mustSwitch}
          cursor={state.cursor}
          selected={state.selected}
          message={hasMessages ? state.queue[0].text : null}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onAdvance={() => dispatch({ type: 'advance' })}
        />
      )}
      {state.menu === 'bag' && (
        <BagScreen cursor={state.cursor} onKeyDown={handleKeyDown} onSelect={handleSelect} />
      )}
      {state.menu === 'summary' && (
        <PartySummary
          pokemon={state.party[state.selected]}
          cursor={state.cursor}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
        />
      )}
      {onField && (
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
      )}
    </main>
  )
}
