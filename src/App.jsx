import { useCallback, useEffect, useRef, useState } from 'react'
import BattleScreen from './components/BattleScreen.jsx'
import BattleTransition from './components/BattleTransition.jsx'
import GameFrame from './components/GameFrame.jsx'
import IntroScreen from './components/IntroScreen.jsx'
import PortfolioPage from './components/PortfolioPage.jsx'
import useView from './hooks/useView.js'

export default function App() {
  const { view, openPortfolio, closePortfolio } = useView()
  const [phase, setPhase] = useState('intro')
  const [won, setWon] = useState(false)
  const [battleKey, setBattleKey] = useState(0)
  const [started, setStarted] = useState(view === 'game')
  const stage = useRef(null)
  const inGame = view === 'game'

  if (inGame && !started) setStarted(true)

  useEffect(() => {
    if (inGame) stage.current?.querySelector('.text-box__button, [tabindex="0"]')?.focus()
  }, [inGame, phase])

  const startBattle = useCallback(() => setPhase('battle'), [])

  const backLabel = won ? 'Play again' : started ? 'Back to the game' : 'Play the game'

  function openWonPortfolio() {
    setWon(true)
    openPortfolio()
  }

  function leavePortfolio() {
    if (won) {
      setWon(false)
      setBattleKey((key) => key + 1)
    }
    closePortfolio()
  }

  return (
    <>
      {started && (
        <GameFrame away={!inGame} stageRef={stage}>
          {phase === 'intro' && <IntroScreen active={inGame} onDone={() => setPhase('transition')} />}
          {phase === 'transition' && <BattleTransition onDone={startBattle} />}
          {phase === 'battle' && <BattleScreen key={battleKey} onRun={openPortfolio} onWin={openWonPortfolio} />}
        </GameFrame>
      )}
      {!inGame && <PortfolioPage onBack={leavePortfolio} backLabel={backLabel} />}
    </>
  )
}
