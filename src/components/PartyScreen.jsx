import useMenuFocus from '../hooks/useMenuFocus.js'
import HpBar from './HpBar.jsx'
import Sprite from './Sprite.jsx'
import TextBox from './TextBox.jsx'

export default function PartyScreen({ party, cursor, onKeyDown, onSelect }) {
  const buttonRef = useMenuFocus(cursor, 'party')
  const cancelIndex = party.length

  return (
    <section className="party" aria-label="Party" onKeyDown={onKeyDown}>
      <div className="party__grid" role="group" aria-label="Party list">
        {party.map((pokemon, index) => (
          <button
            key={pokemon.name}
            ref={buttonRef(index)}
            type="button"
            className={index === cursor ? 'party__card party__card--selected' : 'party__card'}
            aria-label={`${pokemon.name}, level ${pokemon.level}, ${pokemon.hp} of ${pokemon.maxHp} HP`}
            tabIndex={index === cursor ? 0 : -1}
            onClick={() => onSelect(index)}
          >
            <Sprite name={pokemon.name} src={pokemon.sprite} side="party" />
            <span className="party__info">
              <span className="party__top">
                <span className="menu__cursor" aria-hidden="true">
                  {index === cursor ? '▶' : ''}
                </span>
                <span className="party__name">{pokemon.name}</span>
                <span className="party__level">Lv{pokemon.level}</span>
              </span>
              <HpBar pokemon={pokemon} showNumbers />
            </span>
          </button>
        ))}
      </div>
      <div className="screen__footer">
        <TextBox message="Choose a Pokémon." />
        <button
          ref={buttonRef(cancelIndex)}
          type="button"
          className={cancelIndex === cursor ? 'screen__cancel screen__cancel--selected' : 'screen__cancel'}
          tabIndex={cancelIndex === cursor ? 0 : -1}
          onClick={() => onSelect(cancelIndex)}
        >
          <span className="menu__cursor" aria-hidden="true">
            {cancelIndex === cursor ? '▶' : ''}
          </span>
          CANCEL
        </button>
      </div>
    </section>
  )
}
