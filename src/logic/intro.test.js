import { describe, expect, it } from 'vitest'
import { introLines, professor } from '../data/intro.js'
import { MAX_LINE_LENGTH, createIntro, getIntroLine, introReducer } from './intro.js'

const advance = (state) => introReducer(state, { type: 'advance' })
const skip = (state) => introReducer(state, { type: 'skip' })

describe('createIntro', () => {
  it('starts on the first line and is not done', () => {
    expect(createIntro(12)).toEqual({ index: 0, count: 12, done: false })
  })

  it('is already done when there are no lines', () => {
    expect(createIntro(0).done).toBe(true)
  })
})

describe('introReducer', () => {
  it('moves to the next line one at a time', () => {
    let state = createIntro(3)
    state = advance(state)
    expect(state).toMatchObject({ index: 1, done: false })
    state = advance(state)
    expect(state).toMatchObject({ index: 2, done: false })
  })

  it('is done after advancing past the last line', () => {
    let state = createIntro(3)
    for (let step = 0; step < 3; step++) state = advance(state)
    expect(state.done).toBe(true)
  })

  it('goes through every line of the real dialogue and then finishes', () => {
    let state = createIntro(introLines.length)
    const seen = []
    while (!state.done) {
      seen.push(getIntroLine(state, introLines))
      state = advance(state)
    }
    expect(seen).toEqual(introLines)
  })

  it('finishes straight away with skip', () => {
    expect(skip(createIntro(12)).done).toBe(true)
  })

  it('lets skip work from every line, including the first and the last', () => {
    for (let line = 0; line < introLines.length; line++) {
      let state = createIntro(introLines.length)
      for (let step = 0; step < line; step++) state = advance(state)
      expect(state.index).toBe(line)
      expect(skip(state).done).toBe(true)
    }
  })

  it('stays done after it is done', () => {
    const done = skip(createIntro(5))
    expect(advance(done)).toBe(done)
    expect(skip(done)).toBe(done)
  })

  it('ignores unknown actions', () => {
    const state = createIntro(5)
    expect(introReducer(state, { type: 'nothing' })).toBe(state)
  })

  it('does not change the old state', () => {
    const state = createIntro(5)
    advance(state)
    expect(state).toEqual({ index: 0, count: 5, done: false })
  })
})

describe('getIntroLine', () => {
  it('returns the line at the current position', () => {
    const lines = ['one', 'two']
    expect(getIntroLine(createIntro(2), lines)).toBe('one')
    expect(getIntroLine(advance(createIntro(2)), lines)).toBe('two')
  })

  it('returns an empty string when there is no such line', () => {
    expect(getIntroLine(createIntro(0), [])).toBe('')
  })
})

describe('intro dialogue', () => {
  it('has the Professor and the 12 lines in order', () => {
    expect(professor.name).toBe('PROFESSOR')
    expect(professor.sprite).toBe(null)
    expect(introLines[0]).toBe("Hello there! Welcome to Navin's portfolio!")
    expect(introLines.at(-1)).toBe('Good luck!')
  })

  it('has only real lines with no stray spaces', () => {
    for (const line of introLines) {
      expect(line.length).toBeGreaterThan(0)
      expect(line).toBe(line.trim())
    }
  })

  it('keeps every line short enough for the text box, so long ones must be split in two', () => {
    for (const line of introLines) expect(line.length).toBeLessThanOrEqual(MAX_LINE_LENGTH)
  })
})
