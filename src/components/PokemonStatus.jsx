import HpBar from './HpBar.jsx'

export default function PokemonStatus({ pokemon, side }) {
  return (
    <div className={`status status--${side}`}>
      <div className="status__row">
        <span className="status__name">{pokemon.name}</span>
        <span className="status__level">Lv{pokemon.level}</span>
      </div>
      <HpBar pokemon={pokemon} />
    </div>
  )
}
