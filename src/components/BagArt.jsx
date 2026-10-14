import { BACKPACK_ROWS, BAG_ICON_ROWS, artPaths } from '../logic/bagArt.js'
import './BagArt.css'

const backpackPaths = artPaths(BACKPACK_ROWS)
const iconPaths = Object.fromEntries(Object.entries(BAG_ICON_ROWS).map(([name, rows]) => [name, artPaths(rows)]))

function Art({ rows, paths, className }) {
  return (
    <svg
      className={`bag-art ${className}`.trim()}
      viewBox={`0 0 ${rows[0].length} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {Object.entries(paths).map(([name, d]) => (
        <path key={name} className={`bag-art__${name}`} d={d} />
      ))}
    </svg>
  )
}

export function Backpack({ className = '' }) {
  return <Art rows={BACKPACK_ROWS} paths={backpackPaths} className={className} />
}

export function BagIcon({ icon, className = '' }) {
  const rows = BAG_ICON_ROWS[icon]
  return rows ? <Art rows={rows} paths={iconPaths[icon]} className={className} /> : null
}
