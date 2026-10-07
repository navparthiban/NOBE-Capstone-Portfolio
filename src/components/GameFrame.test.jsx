import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useFrame } from '../hooks/useFrame.js'
import GameFrame from './GameFrame.jsx'

const original = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: window.devicePixelRatio,
}

function setViewport(width, height, dpr = 1) {
  for (const [name, value] of [
    ['innerWidth', width],
    ['innerHeight', height],
    ['devicePixelRatio', dpr],
  ]) {
    Object.defineProperty(window, name, { value, configurable: true, writable: true })
  }
}

function resizeTo(width, height, dpr) {
  setViewport(width, height, dpr)
  act(() => {
    window.dispatchEvent(new Event('resize'))
  })
}

function Orientation() {
  return <p>{useFrame().orientation}</p>
}

afterEach(() => {
  setViewport(original.width, original.height, original.dpr)
})

describe('GameFrame', () => {
  it('sizes the frame to fit a desktop window', () => {
    setViewport(1920, 1080)
    const { container } = render(<GameFrame>content</GameFrame>)
    const frame = container.querySelector('.frame')
    expect(frame).toHaveStyle({ width: '1440px', height: '1080px', fontSize: '32px' })
    expect(frame).toHaveAttribute('data-orientation', 'landscape')
    expect(frame).toHaveTextContent('content')
  })

  it('uses the full width of a phone held upright', () => {
    setViewport(390, 844, 3)
    const { container } = render(<GameFrame>content</GameFrame>)
    const frame = container.querySelector('.frame')
    expect(frame).toHaveStyle({ width: '390px', height: '520px' })
    expect(frame).toHaveAttribute('data-orientation', 'portrait')
  })

  it('updates the frame when the window is resized', () => {
    setViewport(1920, 1080)
    const { container } = render(<GameFrame>content</GameFrame>)
    const frame = container.querySelector('.frame')
    expect(frame).toHaveStyle({ width: '1440px' })

    resizeTo(1000, 600)
    expect(frame).toHaveStyle({ width: '800px', height: '600px' })

    resizeTo(390, 844, 3)
    expect(frame).toHaveStyle({ width: '390px', height: '520px' })
    expect(frame).toHaveAttribute('data-orientation', 'portrait')
  })

  it('tells the screens inside which way the frame is oriented', () => {
    setViewport(390, 844, 3)
    render(
      <GameFrame>
        <Orientation />
      </GameFrame>,
    )
    expect(screen.getByText('portrait')).toBeInTheDocument()
    resizeTo(1920, 1080, 1)
    expect(screen.getByText('landscape')).toBeInTheDocument()
  })

  it('stops listening for resizes when it is removed', () => {
    setViewport(1920, 1080)
    const { unmount } = render(<GameFrame>content</GameFrame>)
    unmount()
    expect(() => resizeTo(800, 600)).not.toThrow()
  })
})
