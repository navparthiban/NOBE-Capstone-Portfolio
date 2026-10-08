import { useEffect, useRef, useState } from 'react'
import BattleScreen from './components/BattleScreen.jsx'
import GameFrame from './components/GameFrame.jsx'
import IntroScreen from './components/IntroScreen.jsx'
import PortfolioPage from './components/PortfolioPage.jsx'
import useView from './hooks/useView.js'

export default function App() {
  const { view, openPortfolio, closePortfolio } = useView()
  const [introDone, setIntroDone] = useState(false)
  const [started, setStarted] = useState(view === 'game')
  const stage = useRef(null)
  const inGame = view === 'game'

  if (inGame && !started) setStarted(true)

  useEffect(() => {
    if (inGame) stage.current?.querySelector('.text-box__button, [tabindex="0"]')?.focus()
  }, [inGame])

  return (
    <>
      {started && (
        <GameFrame away={!inGame} stageRef={stage}>
          {introDone ? (
            <BattleScreen onRun={openPortfolio} />
          ) : (
            <IntroScreen active={inGame} onDone={() => setIntroDone(true)} />
          )}
        </GameFrame>
      )}
      {!inGame && <PortfolioPage onBack={closePortfolio} />}
    </>
  )
}
