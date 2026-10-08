import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TRANSITION } from '../logic/transition.js'
import BattleTransition from './BattleTransition.jsx'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('BattleTransition', () => {
  it('draws six bars and a flash', () => {
    const { container } = render(<BattleTransition onDone={() => {}} />)
    expect(container.querySelectorAll('.transition__bar')).toHaveLength(TRANSITION.bars.count)
    expect(container.querySelector('.transition__flash')).toBeInTheDocument()
    expect(container.querySelector('.transition')).toHaveAttribute('data-kind', 'bars')
  })

  it('calls onDone once, only after the duration', () => {
    const onDone = vi.fn()
    render(<BattleTransition onDone={onDone} />)
    act(() => vi.advanceTimersByTime(TRANSITION.bars.duration - 1))
    expect(onDone).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onDone).toHaveBeenCalledTimes(1)
    act(() => vi.advanceTimersByTime(5000))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('does not call onDone after it is removed', () => {
    const onDone = vi.fn()
    const { unmount } = render(<BattleTransition onDone={onDone} />)
    unmount()
    act(() => vi.advanceTimersByTime(5000))
    expect(onDone).not.toHaveBeenCalled()
  })

  it('announces itself to screen readers and hides the pictures from them', () => {
    const { container, getByRole } = render(<BattleTransition onDone={() => {}} />)
    expect(getByRole('status')).toHaveTextContent('Battle starting')
    expect(container.querySelector('.transition__layers')).toHaveAttribute('aria-hidden', 'true')
  })
})
