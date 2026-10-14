export const BACKPACK_SIZE = 24
export const ICON_SIZE = 16

// One character per pixel: o outline, L/M/D light/mid/dark body, F flap, b buckle, p pocket, z zipper
export const BACKPACK_ROWS = [
  '.........oooooo.........',
  '........oDDDDDDo........',
  '........oD....Do........',
  '.....oooooooooooooo.....',
  '....oLLLLLLLLLLLLMMo....',
  '...oLLLLLLLLLLLLLMMMo...',
  '..oFFFFFFFFFFFFFFFFFFo..',
  '..oFFFFFFFFFFFFFFFFFFo..',
  '..oFFFFFFFbbbbFFFFFFFo..',
  '..oFFFFFFFbbbbFFFFFFFo..',
  '..oFFFFFFFFFFFFFFFFFFo..',
  '..oDDDDDDDDDDDDDDDDDDo..',
  '.oLLLLLLLLLLLLLLLLLLMMo.',
  '.oLLLLLLLLLLLLLLLLLLMMo.',
  '.oLLLooooooooooooooLMMo.',
  '.oLLLozzzzzzzzzzzzoLMMo.',
  '.oLLLoppppppppppppoLMMo.',
  '.oLLLoppppppppppppoLMMo.',
  '.oLLLoppppppppppppoLMMo.',
  '.oLLLooooooooooooooLMMo.',
  '.oMMMMMMMMMMMMMMMMMMDDo.',
  '.oMMMMMMMMMMMMMMMMMMDDo.',
  '..oDDDDDDDDDDDDDDDDDDo..',
  '...oooooooooooooooooo...',
]

// o outline, w paper, t text, y gold, n dark gold, a blue, s grey
export const BAG_ICON_ROWS = {
  resume: [
    '.oooooooooooooo.',
    'oyyyyyyyyyyyyyyo',
    '.oooooooooooooo.',
    '...owwwwwwwwo...',
    '...owttttttwo...',
    '...owwwwwwwwo...',
    '...owttttttwo...',
    '...owwwwwwwwo...',
    '...owttttwwwo...',
    '...owwwwwwwwo...',
    '...owttttttwo...',
    '...owwwwwwwwo...',
    '.oooooooooooooo.',
    'onnnnnnnnnnnnnno',
    '.oooooooooooooo.',
    '................',
  ],
  github: [
    '................',
    '................',
    '.........aa.....',
    '.........aa.....',
    '...aa...aa.aa...',
    '..aa....aa..aa..',
    '.aa....aa....aa.',
    'aa.....aa.....aa',
    '.aa...aa.....aa.',
    '..aa..aa....aa..',
    '...aa.aa...aa...',
    '.....aa.........',
    '.....aa.........',
    '................',
    '................',
    '................',
  ],
  linkedin: [
    '................',
    '................',
    '.....oooooo.....',
    '.....o....o.....',
    '.....o....o.....',
    '.oooooooooooooo.',
    '.oyyyyyyyyyyyyo.',
    '.oyyyyyyyyyyyyo.',
    '.oyyyyyyyyyyyyo.',
    '.onnnnnnnnnnnno.',
    '.onnnnoyyonnnno.',
    '.onnnnnnnnnnnno.',
    '.onnnnnnnnnnnno.',
    '.oooooooooooooo.',
    '................',
    '................',
  ],
  email: [
    '................',
    '................',
    '................',
    '.oooooooooooooo.',
    '.osswwwwwwwwsso.',
    '.owsswwwwwwsswo.',
    '.owwsswwwwsswwo.',
    '.owwwsswwsswwwo.',
    '.owwwwsssswwwwo.',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwwo.',
    '.owwwwwwwwwwwwo.',
    '.oooooooooooooo.',
    '................',
    '................',
    '................',
  ],
}

export const BAG_ART_COLORS = {
  o: 'outline',
  L: 'light',
  M: 'mid',
  D: 'dark',
  F: 'flap',
  b: 'buckle',
  p: 'pocket',
  z: 'zipper',
  w: 'paper',
  t: 'text',
  y: 'gold',
  n: 'gold-dark',
  a: 'blue',
  s: 'grey',
}

function pixel(x, y) {
  return `M${x} ${y}h1v1h-1z`
}

export function artPixels(rows) {
  const pixels = {}
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const name = BAG_ART_COLORS[row[x]]
      if (name) (pixels[name] ??= []).push([x, y])
    }
  })
  return pixels
}

export function artPaths(rows) {
  return Object.fromEntries(
    Object.entries(artPixels(rows)).map(([name, list]) => [name, list.map(([x, y]) => pixel(x, y)).join('')]),
  )
}
