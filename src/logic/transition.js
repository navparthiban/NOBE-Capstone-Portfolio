export const TRANSITION = {
  bars: { duration: 1500, count: 6 },
  fade: { duration: 600, count: 0 },
}

export function getTransition(reducedMotion) {
  const kind = reducedMotion ? 'fade' : 'bars'
  return { kind, ...TRANSITION[kind] }
}
