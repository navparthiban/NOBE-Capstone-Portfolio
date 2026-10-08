export const PORTFOLIO_HASH = '#portfolio'

export function getViewFromHash(hash) {
  return hash === PORTFOLIO_HASH ? 'portfolio' : 'game'
}
