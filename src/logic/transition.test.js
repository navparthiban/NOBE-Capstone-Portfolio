import { describe, expect, it } from 'vitest'
import { TRANSITION, getTransition } from './transition.js'

describe('getTransition', () => {
  it('uses the sweeping bars by default', () => {
    expect(getTransition(false)).toEqual({ kind: 'bars', duration: TRANSITION.bars.duration, count: 6 })
  })

  it('uses a fade, with no bars, for reduced motion', () => {
    expect(getTransition(true)).toEqual({ kind: 'fade', duration: TRANSITION.fade.duration, count: 0 })
  })

  it('makes the fade shorter than the bars', () => {
    expect(TRANSITION.fade.duration).toBeLessThan(TRANSITION.bars.duration)
  })
})
