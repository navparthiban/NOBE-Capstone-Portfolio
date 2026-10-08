import { useCallback, useEffect, useRef, useState } from 'react'
import { PORTFOLIO_HASH, getViewFromHash } from '../logic/route.js'

export default function useView() {
  const [view, setView] = useState(() => getViewFromHash(window.location.hash))
  const openedFromGame = useRef(false)

  useEffect(() => {
    const sync = () => setView(getViewFromHash(window.location.hash))
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const openPortfolio = useCallback(() => {
    openedFromGame.current = true
    window.location.hash = PORTFOLIO_HASH
    setView('portfolio')
  }, [])

  const closePortfolio = useCallback(() => {
    if (openedFromGame.current) {
      openedFromGame.current = false
      window.history.back()
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    setView('game')
  }, [])

  return { view, openPortfolio, closePortfolio }
}
