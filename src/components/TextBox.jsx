import { useEffect, useRef } from 'react'
import useTypewriter from '../hooks/useTypewriter.js'

export default function TextBox({ message, interactive = false, onAdvance }) {
  const { shown, done, finish } = useTypewriter(message)
  const button = useRef(null)

  useEffect(() => {
    if (interactive) button.current?.focus()
  }, [interactive, message])

  function handleClick() {
    if (done) onAdvance()
    else finish()
  }

  const text = (
    <>
      <span aria-hidden="true">{shown}</span>
      {interactive && done && (
        <span className="text-box__more" aria-hidden="true">
          ▼
        </span>
      )}
    </>
  )

  return (
    <div className="text-box">
      <p className="visually-hidden" role="status">
        {message}
      </p>
      {interactive ? (
        <button
          ref={button}
          type="button"
          className="text-box__body text-box__button"
          aria-label="Next message"
          onClick={handleClick}
        >
          {text}
        </button>
      ) : (
        <p className="text-box__body">{text}</p>
      )}
    </div>
  )
}
