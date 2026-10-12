export const PLATFORM_WIDTH = 48
export const PLATFORM_HEIGHT = 12

const TOP = { cx: 24, cy: 5, rx: 22, ry: 4 }
const BASE = { cx: 24, cy: 7, rx: 22, ry: 4 }
const TUFTS = [
  [4, 1],
  [9, 2],
  [13, 1],
  [19, 2],
  [26, 1],
  [32, 2],
  [38, 1],
  [43, 2],
]

function inside(oval, x, y) {
  return ((x + 0.5 - oval.cx) / oval.rx) ** 2 + ((y + 0.5 - oval.cy) / oval.ry) ** 2 <= 1
}

function shade(x, y) {
  const roll = (x * x * 3 + y * y * 5 + x * y * 7 + x * 2 + y) % 11
  if (roll < 6) return 'light'
  return roll < 9 ? 'mid' : 'dark'
}

function topRow(x) {
  for (let y = 0; y < PLATFORM_HEIGHT; y++) {
    if (inside(TOP, x, y)) return y
  }
  return null
}

export function platformPixels() {
  const pixels = { rim: [], dark: [], mid: [], light: [] }
  const tufts = new Set()

  for (const [x, height] of TUFTS) {
    const top = topRow(x)
    for (let lift = 1; lift <= height && top - lift >= 0; lift++) {
      tufts.add(`${x},${top - lift}`)
      pixels[lift === height ? 'dark' : 'mid'].push([x, top - lift])
    }
  }

  for (let y = 0; y < PLATFORM_HEIGHT; y++) {
    for (let x = 0; x < PLATFORM_WIDTH; x++) {
      if (inside(TOP, x, y)) {
        const edge = [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].some(([nx, ny]) => !inside(TOP, nx, ny))
        pixels[edge ? 'mid' : shade(x, y)].push([x, y])
      } else if (inside(BASE, x, y) && !tufts.has(`${x},${y}`)) {
        pixels.rim.push([x, y])
      }
    }
  }
  return pixels
}

export function platformPaths() {
  const pixels = platformPixels()
  return Object.fromEntries(
    Object.entries(pixels).map(([name, list]) => [name, list.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('')]),
  )
}
