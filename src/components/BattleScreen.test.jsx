import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import BattleScreen from './BattleScreen.jsx'

function press(key) {
  fireEvent.keyDown(document.activeElement, { key })
}

describe('BattleScreen', () => {
  it('focuses FIGHT when it loads', () => {
    render(<BattleScreen />)
    expect(screen.getByRole('button', { name: /FIGHT/ })).toHaveFocus()
  })

  it('moves the cursor with the arrow keys', () => {
    render(<BattleScreen />)
    press('ArrowRight')
    expect(screen.getByRole('button', { name: /BAG/ })).toHaveFocus()
    press('ArrowDown')
    expect(screen.getByRole('button', { name: /RUN/ })).toHaveFocus()
  })

  it('stays on FIGHT when pressing left or up at the edge', () => {
    render(<BattleScreen />)
    press('ArrowLeft')
    press('ArrowUp')
    expect(screen.getByRole('button', { name: /FIGHT/ })).toHaveFocus()
  })

  it('shows the matching message when an option is clicked', () => {
    render(<BattleScreen />)
    fireEvent.click(screen.getByRole('button', { name: /PARTY/ }))
    expect(screen.getByText('Navin wants to PARTY!')).toBeInTheDocument()
  })

  it('shows the matching message when Enter selects the focused option', () => {
    render(<BattleScreen />)
    press('ArrowRight')
    fireEvent.click(document.activeElement)
    expect(screen.getByText('Navin wants to BAG!')).toBeInTheDocument()
  })
})
