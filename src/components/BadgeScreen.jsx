import { badge } from '../data/badge.js'
import useMenuFocus from '../hooks/useMenuFocus.js'
import TextBox from './TextBox.jsx'

export default function BadgeScreen({ onContinue }) {
  const buttonRef = useMenuFocus(0, 'badge')

  return (
    <section className="badge" aria-label="Badge">
      <div className="badge__body">
        {badge.image ? (
          <img className="badge__image" src={badge.image} alt={badge.name} />
        ) : (
          <div className="badge__placeholder" role="img" aria-label={`${badge.name} image`} />
        )}
        <p className="badge__name">{badge.name}</p>
      </div>
      <div className="screen__footer">
        <TextBox message={badge.prompt} />
        <button ref={buttonRef(0)} type="button" className="screen__cancel screen__cancel--selected" onClick={onContinue}>
          <span className="menu__cursor" aria-hidden="true">
            ▶
          </span>
          CONTINUE
        </button>
      </div>
    </section>
  )
}
