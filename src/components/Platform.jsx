import { PLATFORM_HEIGHT, PLATFORM_WIDTH, platformPaths } from '../logic/platform.js'

const paths = platformPaths()

export default function Platform({ side }) {
  return (
    <svg
      className={`platform platform--${side}`}
      viewBox={`0 0 ${PLATFORM_WIDTH} ${PLATFORM_HEIGHT}`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      {Object.entries(paths).map(([name, d]) => (
        <path key={name} className={`platform__${name}`} d={d} />
      ))}
    </svg>
  )
}
