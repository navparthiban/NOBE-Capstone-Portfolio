import useMenuFocus from '../hooks/useMenuFocus.js'
import HpBar from './HpBar.jsx'
import Sprite from './Sprite.jsx'

export default function PartyScreen({ party, cursor, onKeyDown, onSelect }) {
  const buttonRef = useMenuFocus(cursor, 'party')
  const backIndex = party.length

  return (
    <section className="party" aria-label="Party">
      <h2 className="party__title">Choose a Pokémon</h2>
      <div className="party__list" role="group" aria-label="Party list" onKeyDown={onKeyDown}>
        {party.map((pokemon, index) => (
          <button
            key={pokemon.name}
            ref={buttonRef(index)}
            type="button"
            className="party__row"
            aria-label={`${pokemon.name}, level ${pokemon.level}, ${pokemon.hp} of ${pokemon.maxHp} HP`}
            tabIndex={index === cursor ? 0 : -1}
            onClick={() => onSelect(index)}
          >
            <span className="menu__cursor" aria-hidden="true">
              {index === cursor ? '▶' : ''}
            </span>
            <Sprite name={pokemon.name} src={pokemon.sprite} side="party" />
            <span className="party__name">{pokemon.name}</span>
            <span className="party__level">Lv{pokemon.level}</span>
            <HpBar pokemon={pokemon} />
          </button>
        ))}
        <button
          ref={buttonRef(backIndex)}
          type="button"
          className="party__row party__back"
          tabIndex={backIndex === cursor ? 0 : -1}
          onClick={() => onSelect(backIndex)}
        >
          <span className="menu__cursor" aria-hidden="true">
            {backIndex === cursor ? '▶' : ''}
          </span>
          BACK
        </button>
      </div>
    </section>
  )
}
