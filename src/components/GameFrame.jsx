import { useEffect, useState } from 'react'
import { FrameContext } from '../hooks/useFrame.js'
import { computeFrame } from '../logic/frame.js'

function readViewport() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: window.devicePixelRatio || 1,
  }
}

export default function GameFrame({ children, away = false, stageRef }) {
  const [viewport, setViewport] = useState(readViewport)

  useEffect(() => {
    const update = () => setViewport(readViewport())
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const { orientation, width, height, fontSize } = computeFrame(viewport)

  return (
    <div ref={stageRef} className={away ? 'stage stage--away' : 'stage'} aria-hidden={away || undefined} inert={away}>
      <div className="frame" data-orientation={orientation} style={{ width, height, fontSize }}>
        <FrameContext.Provider value={{ orientation }}>{children}</FrameContext.Provider>
      </div>
    </div>
  )
}
