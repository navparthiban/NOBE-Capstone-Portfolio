import { opponent, player } from '../data/pokemon.js'
import BattleMenu from './BattleMenu.jsx'
import PokemonStatus from './PokemonStatus.jsx'
import Sprite from './Sprite.jsx'
import TextBox from './TextBox.jsx'
import './BattleScreen.css'

export default function BattleScreen() {
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
        <TextBox message="A Recruiter wants to battle!" />
        <BattleMenu />
      </section>
    </main>
  )
}
