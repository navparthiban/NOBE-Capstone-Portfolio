import { useId } from 'react'
import { BADGE_SIZE, badgePaths, shinePath } from '../logic/badgeArt.js'
import './BadgeArt.css'

const { silhouette, ...colors } = badgePaths()
const shine = shinePath()

export default function BadgeArt({ className = '', label = 'Portfolio Badge' }) {
  const clipId = useId()

  return (
    <svg
      className={`badge-art ${className}`.trim()}
      viewBox={`0 0 ${BADGE_SIZE} ${BADGE_SIZE}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={label}
    >
      <clipPath id={clipId}>
        <path d={silhouette} />
      </clipPath>
      {Object.entries(colors).map(([name, d]) => (
        <path key={name} className={`badge-art__${name}`} d={d} />
      ))}
      <g clipPath={`url(#${clipId})`}>
        <path className="badge-art__shine" d={shine} />
      </g>
    </svg>
  )
}
