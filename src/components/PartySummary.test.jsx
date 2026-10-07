import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PartySummary from './PartySummary.jsx'

const bare = { name: 'TESTMON', level: 5, hp: 10, maxHp: 10, sprite: null, experience: 'Something' }

function renderSummary(pokemon) {
  return render(<PartySummary pokemon={pokemon} cursor={0} onKeyDown={() => {}} onSelect={() => {}} />)
}

describe('PartySummary', () => {
  it('renders a Pokémon that is missing every optional field', () => {
    const { container } = renderSummary(bare)
    expect(screen.getByRole('heading', { name: /TESTMON/ })).toBeInTheDocument()
    expect(screen.getByText('Something')).toBeInTheDocument()
    expect(screen.queryByText('Role')).not.toBeInTheDocument()
    expect(screen.queryByText('Dates')).not.toBeInTheDocument()
    expect(container).not.toHaveTextContent('undefined')
  })

  it('skips only the dates row when only the dates are missing', () => {
    renderSummary({ ...bare, role: 'Builder', type: 'Project', description: 'Made a thing.' })
    expect(screen.getByText('Builder')).toBeInTheDocument()
    expect(screen.getByText('Project')).toBeInTheDocument()
    expect(screen.getByText('Made a thing.')).toBeInTheDocument()
    expect(screen.queryByText('Dates')).not.toBeInTheDocument()
  })

  it('shows the dates when they are given', () => {
    renderSummary({ ...bare, dates: 'Fall 2025' })
    expect(screen.getByText('Dates')).toBeInTheDocument()
    expect(screen.getByText('Fall 2025')).toBeInTheDocument()
  })
})
