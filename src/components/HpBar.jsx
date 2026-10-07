import { getHpPercent } from '../logic/battle.js'

function hpColor(percent) {
  if (percent > 50) return 'high'
  if (percent > 20) return 'mid'
  return 'low'
}

export default function HpBar({ pokemon, showNumbers = false }) {
  const percent = getHpPercent(pokemon.hp, pokemon.maxHp)

  return (
    <div
      className="hp"
      role="progressbar"
      aria-label={`${pokemon.name} HP`}
      aria-valuemin={0}
      aria-valuemax={pokemon.maxHp}
      aria-valuenow={pokemon.hp}
    >
      <span className="hp__label">HP</span>
      <div className="hp__track">
        <div className={`hp__fill hp__fill--${hpColor(percent)}`} style={{ width: `${percent}%` }} />
      </div>
      {showNumbers && (
        <span className="hp__numbers">
          {pokemon.hp}/{pokemon.maxHp}
        </span>
      )}
    </div>
  )
}
