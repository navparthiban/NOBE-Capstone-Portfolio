export const BADGE_SIZE = 24

// One character per pixel: o outline, L/M/D light/mid/dark metal, b brackets, k flask outline, g glass, l liquid
export const BADGE_ROWS = [
  '......oooooooooooo......',
  '.....oLLLLLLLLLLLMo.....',
  '....oLLLLLLLLLLLMMMo....',
  '...oLLLLLLLLLLLMMMMMo...',
  '..oLLLLLLLLLLLMMMMMMMo..',
  '.oLLLLLLLLLLLMMMMMMMMMo.',
  'oLLLLLLLLLLLMMMMMMMMMMMo',
  'oLLLLLLLLLkkkkMMMMMMMMMo',
  'oLLLLLLLLLkggkMMMMMMMMMo',
  'oLLLLbLLLMkggkMMMMbMMMDo',
  'oLLLbLLLMMkggkMMMMMbMDDo',
  'oLLbLLLMMkggggkMMMMMbDDo',
  'oLLLbLMMkggggggkMMMbDDDo',
  'oLLLLbMkllllllllkMbDDDDo',
  'oLLLMMMkllllllllkDDDDDDo',
  'oLLMMMMkkkkkkkkkkDDDDDDo',
  'oLMMMMMMMMMMMMMDDDDDDDDo',
  'oMMMMMMMMMMMMMDDDDDDDDDo',
  '.oMMMMMMMMMMMDDDDDDDDDo.',
  '..oMMMMMMMMMDDDDDDDDDo..',
  '...oMMMMMMMDDDDDDDDDo...',
  '....oMMMMMDDDDDDDDDo....',
  '.....oMMMDDDDDDDDDo.....',
  '......oooooooooooo......',
]

export const BADGE_COLORS = {
  o: 'outline',
  L: 'light',
  M: 'mid',
  D: 'dark',
  b: 'bracket',
  k: 'flask',
  g: 'glass',
  l: 'liquid',
}

const SHINE_WIDTH = 3

function pixel(x, y) {
  return `M${x} ${y}h1v1h-1z`
}

export function badgePixels() {
  const pixels = Object.fromEntries(Object.values(BADGE_COLORS).map((name) => [name, []]))
  BADGE_ROWS.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (BADGE_COLORS[row[x]]) pixels[BADGE_COLORS[row[x]]].push([x, y])
    }
  })
  return pixels
}

export function badgePaths() {
  const paths = Object.fromEntries(
    Object.entries(badgePixels()).map(([name, list]) => [name, list.map(([x, y]) => pixel(x, y)).join('')]),
  )
  paths.silhouette = Object.values(badgePixels())
    .flat()
    .map(([x, y]) => pixel(x, y))
    .join('')
  return paths
}

// A slanted band of whole pixels that starts at x = 0 on the top row and leans left going down.
export function shinePixels() {
  const pixels = []
  for (let y = 0; y < BADGE_SIZE; y++) {
    for (let x = -y; x < -y + SHINE_WIDTH; x++) pixels.push([x, y])
  }
  return pixels
}

export function shinePath() {
  return shinePixels()
    .map(([x, y]) => pixel(x, y))
    .join('')
}

// Sweeping the band by these offsets takes it from fully left of the badge to fully right of it.
export const SHINE_START = -SHINE_WIDTH
export const SHINE_END = BADGE_SIZE * 2 - 1
