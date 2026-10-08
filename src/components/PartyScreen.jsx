import useMenuFocus from '../hooks/useMenuFocus.js'
import { getMenuOptions } from '../logic/battle.js'
import HpBar from './HpBar.jsx'
import Sprite from './Sprite.jsx'
import TextBox from './TextBox.jsx'

function cardClass(selected, fainted) {
  return ['party__card', selected && 'party__card--selected', fainted && 'party__card--fainted'].filter(Boolean).join(' ')
}

export default function PartyScreen({ party, menu, forced, cursor, selected, message, onKeyDown, onSelect, onAdvance }) {
  const optionsOpen = menu === 'partyMenu'
  const hasMessage = message !== null
  const idle = !hasMessage
  const cardRef = useMenuFocus(idle && !optionsOpen ? cursor : -1, menu, hasMessage)
  const optionRef = useMenuFocus(idle && optionsOpen ? cursor : -1, menu, hasMessage)
  const cancelIndex = party.length
  const highlighted = optionsOpen ? selected : cursor
  const cardsActive = idle && !optionsOpen
  const prompt = optionsOpen
    ? `Do what with ${party[selected].name}?`
    : forced
      ? 'Bring out which Pokémon?'
      : 'Choose a Pokémon.'

  return (
    <section className="party" aria-label="Party" onKeyDown={onKeyDown}>
      <div className="party__grid" role="group" aria-label="Party list">
        {party.map((pokemon, index) => (
          <button
            key={pokemon.name}
            ref={cardRef(index)}
            type="button"
            className={cardClass(index === highlighted, pokemon.hp === 0)}
            aria-label={`${pokemon.name}, level ${pokemon.level}, ${pokemon.hp} of ${pokemon.maxHp} HP${pokemon.hp === 0 ? ', fainted' : ''}`}
            tabIndex={cardsActive && index === cursor ? 0 : -1}
            onClick={() => cardsActive && onSelect(index)}
          >
            <Sprite name={pokemon.name} src={pokemon.sprite} side="party" />
            <span className="party__info">
              <span className="party__top">
                <span className="menu__cursor" aria-hidden="true">
                  {index === highlighted ? '▶' : ''}
                </span>
                <span className="party__name">{pokemon.name}</span>
                <span className="party__level">Lv{pokemon.level}</span>
              </span>
              <HpBar pokemon={pokemon} showNumbers />
            </span>
          </button>
        ))}
      </div>
      {optionsOpen && idle && (
        <div className="party__options" role="group" aria-label={`${party[selected].name} options`}>
          {getMenuOptions('partyMenu').map((option, index) => (
            <button
              key={option}
              ref={optionRef(index)}
              type="button"
              className="menu__option"
              tabIndex={index === cursor ? 0 : -1}
              onClick={() => onSelect(index)}
            >
              <span className="menu__cursor" aria-hidden="true">
                {index === cursor ? '▶' : ''}
              </span>
              {option}
            </button>
          ))}
        </div>
      )}
      <div className="screen__footer">
        <TextBox message={hasMessage ? message : prompt} interactive={hasMessage} onAdvance={onAdvance} />
        {!forced && (
          <button
            ref={cardRef(cancelIndex)}
            type="button"
            className={
              cardsActive && cancelIndex === cursor ? 'screen__cancel screen__cancel--selected' : 'screen__cancel'
            }
            tabIndex={cardsActive && cancelIndex === cursor ? 0 : -1}
            onClick={() => cardsActive && onSelect(cancelIndex)}
          >
            <span className="menu__cursor" aria-hidden="true">
              {cardsActive && cancelIndex === cursor ? '▶' : ''}
            </span>
            CANCEL
          </button>
        )}
      </div>
    </section>
  )
}
