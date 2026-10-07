import { useState } from 'react'
import { opponent, player } from '../data/pokemon.js'
import { getMenuOptions, getSelectionMessage, moveCursor } from '../logic/battle.js'
import BattleMenu from './BattleMenu.jsx'
import PokemonStatus from './PokemonStatus.jsx'
import Sprite from './Sprite.jsx'
import TextBox from './TextBox.jsx'
import './BattleScreen.css'

export default function BattleScreen() {
  const [cursor, setCursor] = useState(0)
  const [message, setMessage] = useState('A Recruiter wants to battle!')

  function handleKeyDown(event) {
    if (!event.key.startsWith('Arrow')) return
    event.preventDefault()
    setCursor(moveCursor(cursor, event.key))
  }

  function handleSelect(index) {
    setCursor(index)
    setMessage(getSelectionMessage(getMenuOptions()[index]))
  }

  return (
    <main className="battle">
      <h1 className="visually-hidden">Navin's Portfolio</h1>
      <section className="field">
        <PokemonStatus pokemon={opponent} side="opponent" />
        <Sprite name={opponent.name} src={opponent.sprite} side="opponent" />
        <Sprite name={player.name} src={player.sprite} side="player" />
        <PokemonStatus pokemon={player} side="player" />
      </section>
      <section className="panel">
        <TextBox message={message} />
        <BattleMenu cursor={cursor} onKeyDown={handleKeyDown} onSelect={handleSelect} />
      </section>
    </main>
  )
}
