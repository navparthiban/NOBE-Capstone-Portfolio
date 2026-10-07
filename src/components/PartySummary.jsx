import useMenuFocus from '../hooks/useMenuFocus.js'
import { getMenuOptions } from '../logic/battle.js'
import HpBar from './HpBar.jsx'
import Sprite from './Sprite.jsx'

export default function PartySummary({ pokemon, cursor, onKeyDown, onSelect }) {
  const buttonRef = useMenuFocus(cursor, 'summary')
  const details = [
    ['Experience', pokemon.experience],
    ['Role', pokemon.role],
    ['Dates', pokemon.dates],
  ].filter(([, value]) => value)

  return (
    <section className="summary" aria-label={`${pokemon.name} summary`}>
      <div className="summary__header">
        <Sprite name={pokemon.name} src={pokemon.sprite} side="party" />
        <div>
          <h2 className="summary__name">
            {pokemon.name} <span className="summary__level">Lv{pokemon.level}</span>
          </h2>
          {pokemon.type && <span className="summary__type">{pokemon.type}</span>}
        </div>
      </div>
      <HpBar pokemon={pokemon} />
      <dl className="summary__details">
        {details.map(([label, value]) => (
          <div key={label} className="summary__detail">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      {pokemon.description && <p className="summary__description">{pokemon.description}</p>}
      <div className="summary__menu" role="group" aria-label="Summary menu" onKeyDown={onKeyDown}>
        {getMenuOptions('summary').map((option, index) => (
          <button
            key={option}
            ref={buttonRef(index)}
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
    </section>
  )
}
