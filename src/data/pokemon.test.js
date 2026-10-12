import { describe, expect, it } from 'vitest'
import { recruiterTeam } from './pokemon.js'

describe('recruiter team data', () => {
  it('is WATCHOG, HYPNO, BISHARP in that order', () => {
    expect(recruiterTeam.map((pokemon) => pokemon.name)).toEqual(['WATCHOG', 'HYPNO', 'BISHARP'])
  })

  it('gives every Pokémon a sprite', () => {
    for (const pokemon of recruiterTeam) {
      expect(pokemon.sprite).toBeTruthy()
    }
  })
})
