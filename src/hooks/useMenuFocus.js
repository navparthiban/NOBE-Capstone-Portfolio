import { useEffect, useRef } from 'react'

export default function useMenuFocus(cursor, menu, version) {
  const buttons = useRef([])

  useEffect(() => {
    buttons.current[cursor]?.focus()
  }, [cursor, menu, version])

  return (index) => (element) => {
    buttons.current[index] = element
  }
}
