import { useEffect, useState } from 'react'
import { introLines, professor } from '../data/intro.js'
import { createIntro, getIntroLine, introReducer } from '../logic/intro.js'
import Sprite from './Sprite.jsx'
import TextBox from './TextBox.jsx'

export default function IntroScreen({ onDone, active = true }) {
  const [intro, setIntro] = useState(() => createIntro(introLines.length))

  function send(action) {
    const next = introReducer(intro, action)
    if (next.done) onDone()
    else setIntro(next)
  }

  useEffect(() => {
    if (!active) return undefined
    function handleKeyDown(event) {
      if (event.key === 'Escape' && introReducer(intro, { type: 'skip' }).done) onDone()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [intro, onDone, active])

  return (
    <main className="battle">
      <h1 className="visually-hidden">Navin's Portfolio</h1>
      <section className="field" aria-label="Professor">
        <Sprite name={professor.name} src={professor.sprite} side="professor" />
      </section>
      <section className="panel panel--full">
        <TextBox
          message={getIntroLine(intro, introLines)}
          interactive
          onAdvance={() => send({ type: 'advance' })}
        />
      </section>
      <button
        type="button"
        className="intro__skip"
        aria-keyshortcuts="Escape"
        onClick={() => send({ type: 'skip' })}
      >
        SKIP
      </button>
    </main>
  )
}
