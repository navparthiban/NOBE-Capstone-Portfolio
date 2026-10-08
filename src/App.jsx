import { useState } from 'react'
import BattleScreen from './components/BattleScreen.jsx'
import GameFrame from './components/GameFrame.jsx'
import IntroScreen from './components/IntroScreen.jsx'

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <GameFrame>
      {introDone ? <BattleScreen /> : <IntroScreen onDone={() => setIntroDone(true)} />}
    </GameFrame>
  )
}
