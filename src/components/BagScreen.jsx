import { useState } from 'react'
import { bagItems } from '../data/bag.js'
import { getLinkProps } from '../logic/links.js'
import useMenuFocus from '../hooks/useMenuFocus.js'
import { Backpack, BagIcon } from './BagArt.jsx'
import TextBox from './TextBox.jsx'

export default function BagScreen({ cursor, onKeyDown, onSelect }) {
  const buttonRef = useMenuFocus(cursor, 'bag')
  const cancelIndex = bagItems.length
  const [copied, setCopied] = useState(null)
  const current = bagItems[cursor]
  const message = !current
    ? 'Close the bag.'
    : copied === current.name
      ? current.copiedMessage
      : current.description

  function handleClick(item, index) {
    setCopied(null)
    onSelect(index)
    if (item.copyText) {
      navigator.clipboard
        ?.writeText(item.copyText)
        .then(() => setCopied(item.name))
        .catch(() => {})
    }
  }

  return (
    <section className="bag" aria-label="Bag" onKeyDown={onKeyDown}>
      <div className="bag__body">
        <div className="bag__pocket" aria-hidden="true">
          <Backpack className="bag__art" />
          <span>BAG</span>
        </div>
        <ul className="bag__list" aria-label="Bag items">
          {bagItems.map((item, index) => {
            const className = index === cursor ? 'bag__item bag__item--selected' : 'bag__item'
            const cursorMark = (
              <span className="menu__cursor" aria-hidden="true">
                {index === cursor ? '▶' : ''}
              </span>
            )
            return (
              <li key={item.name}>
                <a
                  ref={buttonRef(index)}
                  className={className}
                  {...getLinkProps(item)}
                  tabIndex={index === cursor ? 0 : -1}
                  onClick={() => handleClick(item, index)}
                >
                  {cursorMark}
                  <BagIcon icon={item.icon} className="bag__icon" />
                  {item.name}
                  {item.external && <span className="visually-hidden"> (opens in a new tab)</span>}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="screen__footer screen__footer--tall">
        <TextBox message={message} />
        <button
          ref={buttonRef(cancelIndex)}
          type="button"
          className={cancelIndex === cursor ? 'screen__cancel screen__cancel--selected' : 'screen__cancel'}
          tabIndex={cancelIndex === cursor ? 0 : -1}
          onClick={() => onSelect(cancelIndex)}
        >
          <span className="menu__cursor" aria-hidden="true">
            {cancelIndex === cursor ? '▶' : ''}
          </span>
          CANCEL
        </button>
      </div>
    </section>
  )
}
