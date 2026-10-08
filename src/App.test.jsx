import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { introLines } from './data/intro.js'

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

function nextMessage() {
  tick(4000)
  fireEvent.click(screen.getByRole('button', { name: 'Next message' }))
}

const status = () => screen.getByRole('status')
const inBattle = () => screen.queryByRole('button', { name: 'SKIP' }) === null

describe('App', () => {
  it('opens on the Professor intro, not the battle', () => {
    render(<App />)
    expect(status()).toHaveTextContent(introLines[0])
    expect(screen.getByRole('button', { name: 'SKIP' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'FIGHT' })).not.toBeInTheDocument()
  })

  it('ends on the battle after advancing through every line', () => {
    render(<App />)
    for (let line = 0; line < introLines.length; line++) {
      expect(status()).toHaveTextContent(introLines[line])
      expect(inBattle()).toBe(false)
      nextMessage()
    }
    expect(inBattle()).toBe(true)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('goes straight to the battle with SKIP', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
    expect(inBattle()).toBe(true)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('goes straight to the battle with Escape', () => {
    render(<App />)
    nextMessage()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(inBattle()).toBe(true)
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('lets SKIP work from the last line too', () => {
    render(<App />)
    for (let line = 0; line < introLines.length - 1; line++) nextMessage()
    expect(status()).toHaveTextContent('Good luck!')
    fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
    expect(status()).toHaveTextContent('A Recruiter wants to battle!')
  })

  it('plays the battle normally after the intro, and Escape in the battle is harmless', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'SKIP' }))
    nextMessage()
    nextMessage()
    nextMessage()
    expect(screen.getByRole('button', { name: 'FIGHT' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement, { key: 'Escape' })
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('button', { name: 'FIGHT' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'SKIP' })).not.toBeInTheDocument()
  })
})
