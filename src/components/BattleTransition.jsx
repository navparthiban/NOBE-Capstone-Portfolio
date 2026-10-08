import { useEffect, useState } from 'react'
import prefersReducedMotion from '../hooks/reducedMotion.js'
import { getTransition } from '../logic/transition.js'

export default function BattleTransition({ onDone }) {
  const [{ kind, duration, count }] = useState(() => getTransition(prefersReducedMotion()))

  useEffect(() => {
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [onDone, duration])

  return (
    <div className="transition" data-kind={kind} style={{ '--duration': `${duration}ms`, '--bars': count }}>
      <p className="visually-hidden" role="status">
        Battle starting
      </p>
      <div className="transition__layers" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className="transition__bar" style={{ '--index': index }} />
        ))}
        <span className="transition__flash" />
      </div>
    </div>
  )
}
