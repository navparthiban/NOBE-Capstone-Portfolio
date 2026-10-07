export function getMenuOptions() {
  return ['FIGHT', 'BAG', 'PARTY', 'RUN']
}

export function getHpPercent(hp, maxHp) {
  if (maxHp <= 0) return 0
  return Math.min(100, Math.max(0, (hp / maxHp) * 100))
}
