import pokeball from '../assets/sprites/pokeball.svg'

export default function Sprite({ name, src, side, fx }) {
  return (
    <div className={`sprite sprite--${side}`} data-fx={fx || undefined}>
      <div className="sprite__body">
        {src ? (
          <img src={src} alt={name} />
        ) : (
          <div className="sprite__placeholder" role="img" aria-label={`${name} sprite`} />
        )}
      </div>
      {fx && <img className="sprite__ball" src={pokeball} alt="" />}
    </div>
  )
}
