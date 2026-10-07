import { getMenuOptions } from '../logic/battle.js'

export default function BattleMenu() {
  return (
    <div className="menu" role="group" aria-label="Battle menu">
      {getMenuOptions().map((option) => (
        <button key={option} type="button" className="menu__option">
          {option}
        </button>
      ))}
    </div>
  )
}
