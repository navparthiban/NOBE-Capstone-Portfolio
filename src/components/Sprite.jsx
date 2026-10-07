export default function Sprite({ name, src, side }) {
  return (
    <div className={`sprite sprite--${side}`}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <div className="sprite__placeholder" role="img" aria-label={`${name} sprite`} />
      )}
    </div>
  )
}
