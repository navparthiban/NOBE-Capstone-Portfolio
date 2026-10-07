import { useEffect, useRef } from 'react'

export default function useMenuFocus(cursor, menu) {
  const buttons = useRef([])

  useEffect(() => {
    buttons.current[cursor]?.focus()
  }, [cursor, menu])

  return (index) => (element) => {
    buttons.current[index] = element
  }
}
