export const MAX_LINE_LENGTH = 100

export function createIntro(lineCount) {
  return { index: 0, count: lineCount, done: lineCount <= 0 }
}

export function introReducer(state, action) {
  if (state.done) return state

  if (action.type === 'skip') return { ...state, done: true }

  if (action.type === 'advance') {
    const index = state.index + 1
    return index >= state.count ? { ...state, done: true } : { ...state, index }
  }

  return state
}

export function getIntroLine(state, lines) {
  return lines[state.index] ?? ''
}
