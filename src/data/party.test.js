import { describe, expect, it } from 'vitest'
import { party } from './party.js'

describe('party data', () => {
  it('has six Pokémon', () => {
    expect(party).toHaveLength(6)
  })

  it('gives every Pokémon a unique name', () => {
    const names = party.map((pokemon) => pokemon.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('gives every Pokémon the fields the screens need', () => {
    for (const pokemon of party) {
      expect(pokemon.name).toBeTruthy()
      expect(pokemon.experience).toBeTruthy()
      expect(pokemon.level).toBeGreaterThan(0)
      expect(pokemon.maxHp).toBeGreaterThan(0)
      expect(pokemon.hp).toBe(pokemon.maxHp)
    }
  })
})
