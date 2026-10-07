import { useSyncExternalStore } from 'react'

export default function useMediaQuery(query) {
  const subscribe = (notify) => {
    const list = window.matchMedia?.(query)
    list?.addEventListener('change', notify)
    return () => list?.removeEventListener('change', notify)
  }
  const getSnapshot = () => window.matchMedia?.(query).matches ?? false

  return useSyncExternalStore(subscribe, getSnapshot)
}
