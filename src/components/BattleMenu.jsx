import { useEffect, useRef } from 'react'
import { getMenuOptions } from '../logic/battle.js'

export default function BattleMenu({ menu, cursor, onKeyDown, onSelect }) {
  const buttons = useRef([])

  useEffect(() => {
    buttons.current[cursor]?.focus()
  }, [cursor, menu])

  return (
    <div className="menu" role="group" aria-label="Battle menu" onKeyDown={onKeyDown}>
      {getMenuOptions(menu).map((option, index) => (
        <button
          key={option}
          ref={(el) => (buttons.current[index] = el)}
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
  )
}
