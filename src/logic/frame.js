const LANDSCAPE = { ratio: 4 / 3, step: 4, ems: 40 }
const PORTRAIT = { ratio: 3 / 4, step: 3, ems: 30 }
const FONT_GRID = 8

export function computeFrame({ width, height, dpr = 1 }) {
  const scale = dpr > 0 ? dpr : 1
  const portrait = width < height
  const { ratio, step, ems } = portrait ? PORTRAIT : LANDSCAPE

  const fitWidth = Math.min(Math.max(width, 0), Math.max(height, 0) * ratio)
  const deviceWidth = Math.floor((fitWidth * scale) / step) * step
  const deviceHeight = deviceWidth / ratio
  const deviceFont = Math.max(FONT_GRID, Math.floor(deviceWidth / ems / FONT_GRID) * FONT_GRID)

  return {
    orientation: portrait ? 'portrait' : 'landscape',
    width: deviceWidth / scale,
    height: deviceHeight / scale,
    fontSize: deviceFont / scale,
  }
}
