import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { introLines } from '../data/intro.js'
import IntroScreen from './IntroScreen.jsx'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

function tick(ms) {
  for (let elapsed = 0; elapsed < ms; elapsed += 25) {
    act(() => vi.advanceTimersByTime(25))
  }
}

function nextLine() {
  tick(4000)
  fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
}

const status = () => screen.getByRole('status')
const clickSkip = () => fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
const pressEscape = () => fireEvent.keyDown(window, { key: 'Escape' })

function renderAt(line) {
  const onDone = vi.fn()
  const view = render(<IntroScreen onDone={onDone} />)
  for (let step = 0; step < line; step++) nextLine()
  return { onDone, ...view }
}

describe('IntroScreen', () => {
  it('starts with the Professor placeholder, the first line, and a SKIP button', () => {
    renderAt(0)
    expect(screen.getByRole('img', { name: 'PROFESSOR sprite' })).toBeInTheDocument()
    expect(status()).toHaveTextContent(introLines[0])
    expect(screen.getByRole('button', { name: 'SKIP' })).toBeInTheDocument()
  })

  it('focuses the text box so Enter works straight away', () => {
    renderAt(0)
    expect(screen.getByRole('button', { name: 'Next message' })).toHaveFocus()
  })

  it('types the line out and does not show the next one yet', () => {
    const { container } = renderAt(0)
    const body = container.querySelector('.text-box__body')
    tick(100)
    expect(body.textContent.length).toBeLessThan(introLines[0].length)
    expect(body).toHaveTextContent('Hell')
  })

  it('advances one line at a time and only finishes after the last line', () => {
    const { onDone } = renderAt(0)
    for (let line = 1; line < introLines.length; line++) {
      nextLine()
      expect(status()).toHaveTextContent(introLines[line])
      expect(onDone).not.toHaveBeenCalled()
    }
    nextLine()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('finishes the line instead of skipping ahead when it is pressed while still typing', () => {
    const { onDone, container } = renderAt(0)
    const body = container.querySelector('.text-box__body')
    tick(100)
    expect(body).not.toHaveTextContent(introLines[0])
    fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
    expect(body).toHaveTextContent(introLines[0])
    expect(status()).toHaveTextContent(introLines[0])
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
    expect(status()).toHaveTextContent(introLines[1])
  })

  it('does the same on the last line: the first press finishes it, the second ends the intro', () => {
    const { onDone } = renderAt(introLines.length - 1)
    tick(100)
    fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
    expect(status()).toHaveTextContent('Good luck!')
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('IntroScreen SKIP', () => {
  it('ends the intro with the SKIP button from every line, including the first and the last', () => {
    for (let line = 0; line < introLines.length; line++) {
      const { onDone, unmount } = renderAt(line)
      expect(status()).toHaveTextContent(introLines[line])
      clickSkip()
      expect(onDone).toHaveBeenCalledTimes(1)
      unmount()
    }
  })

  it('works while a line is still typing', () => {
    const { onDone } = renderAt(3)
    tick(100)
    clickSkip()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('can be reached and used with the keyboard', () => {
    const { onDone } = renderAt(0)
    const skip = screen.getByRole('button', { name: 'SKIP' })
    skip.focus()
    expect(skip).toHaveFocus()
    expect(skip).toHaveAttribute('aria-keyshortcuts', 'Escape')
    fireEvent.click(skip)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})

describe('IntroScreen Escape', () => {
  it('ends the intro from every line, including the first and the last', () => {
    for (let line = 0; line < introLines.length; line++) {
      const { onDone, unmount } = renderAt(line)
      pressEscape()
      expect(onDone).toHaveBeenCalledTimes(1)
      unmount()
    }
  })

  it('works while a line is still typing, and wherever the focus is', () => {
    const { onDone } = renderAt(0)
    tick(100)
    screen.getByRole('button', { name: 'SKIP' }).focus()
    pressEscape()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('ignores other keys', () => {
    const { onDone } = renderAt(0)
    for (const key of ['a', 'ArrowDown', 'Tab', 'Backspace']) fireEvent.keyDown(window, { key })
    expect(onDone).not.toHaveBeenCalled()
    expect(status()).toHaveTextContent(introLines[0])
  })

  it('ignores Escape while it is inactive, and listens again when it is active', () => {
    const onDone = vi.fn()
    const { rerender } = render(<IntroScreen onDone={onDone} active={false} />)
    pressEscape()
    expect(onDone).not.toHaveBeenCalled()
    rerender(<IntroScreen onDone={onDone} active />)
    pressEscape()
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('stops listening once the intro is gone', () => {
    const { onDone, unmount } = renderAt(0)
    unmount()
    pressEscape()
    expect(onDone).not.toHaveBeenCalled()
  })
})
