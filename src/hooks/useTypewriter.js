import { useEffect, useState } from 'react'
import prefersReducedMotion from './reducedMotion.js'

export default function useTypewriter(text, speed = 25) {
  const [progress, setProgress] = useState({ text, count: 0 })
  const reduced = prefersReducedMotion()
  const count = reduced ? text.length : progress.text === text ? progress.count : 0
  const done = count >= text.length

  useEffect(() => {
    if (done) return undefined
    const timer = setTimeout(() => setProgress({ text, count: count + 1 }), speed)
    return () => clearTimeout(timer)
  }, [text, count, done, speed])

  function finish() {
    setProgress({ text, count: text.length })
  }

  return { shown: text.slice(0, count), done, finish }
}
