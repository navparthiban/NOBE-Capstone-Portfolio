import { createContext, useContext } from 'react'

export const FrameContext = createContext({ orientation: 'landscape' })

export function useFrame() {
  return useContext(FrameContext)
}
