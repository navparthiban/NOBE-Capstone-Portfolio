import { badge } from '../data/badge.js'
import useMenuFocus from '../hooks/useMenuFocus.js'
import BadgeArt from './BadgeArt.jsx'
import TextBox from './TextBox.jsx'

export default function BadgeScreen({ onContinue }) {
  const buttonRef = useMenuFocus(0, 'badge')

  return (
    <section className="badge" aria-label="Badge">
      <div className="badge__body">
        <BadgeArt className="badge__image" />
        <p className="badge__name">{badge.name}</p>
      </div>
      <div className="screen__footer screen__footer--tall">
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
