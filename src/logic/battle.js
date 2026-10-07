export const MENU_COLUMNS = 2

export function getMenuOptions() {
  return ['FIGHT', 'BAG', 'PARTY', 'RUN']
}

export function moveCursor(index, key, count = getMenuOptions().length, columns = MENU_COLUMNS) {
  const column = index % columns
  const moves = {
    ArrowLeft: column > 0 ? index - 1 : index,
    ArrowRight: column < columns - 1 && index + 1 < count ? index + 1 : index,
    ArrowUp: index - columns >= 0 ? index - columns : index,
    ArrowDown: index + columns < count ? index + columns : index,
  }
  return moves[key] ?? index
}

export function getSelectionMessage(option) {
  return `Navin wants to ${option}!`
}

export function getHpPercent(hp, maxHp) {
  if (maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (hp / maxHp) * 100))
}
