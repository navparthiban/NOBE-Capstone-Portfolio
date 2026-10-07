import { getMenuOptions } from './logic/battle.js'
import './App.css'

export default function App() {
  return (
    <main className="battle">
      <h1 className="battle__title">Navin's Portfolio</h1>
      <p className="battle__text">A Recruiter wants to battle!</p>
      <ul className="battle__menu">
        {getMenuOptions().map((option) => (
          <li key={option}>{option}</li>
        ))}
      </ul>
    </main>
  )
}
