import { useState } from 'react'
import { bagItems } from '../data/bag.js'
import useFileAvailable from '../hooks/useFileAvailable.js'
import useMenuFocus from '../hooks/useMenuFocus.js'
import TextBox from './TextBox.jsx'

export default function BagScreen({ cursor, onKeyDown, onSelect }) {
  const resumeAvailable = useFileAvailable(bagItems[0].url, 'pdf')
  const buttonRef = useMenuFocus(cursor, 'bag', resumeAvailable)
  const cancelIndex = bagItems.length
  const isMissing = (item) => item.missingMessage !== undefined && !resumeAvailable
  const [copied, setCopied] = useState(null)
  const current = bagItems[cursor]
  const message = !current
    ? 'Close the bag.'
    : isMissing(current)
      ? current.missingMessage
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
          <div className="bag__art" />
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
                {isMissing(item) ? (
                  <button
                    ref={buttonRef(index)}
                    type="button"
                    className={`${className} bag__item--missing`}
                    aria-disabled="true"
                    tabIndex={index === cursor ? 0 : -1}
                    onClick={() => handleClick(item, index)}
                  >
                    {cursorMark}
                    {item.name}
                    <span className="visually-hidden"> (not available yet)</span>
                  </button>
                ) : (
                  <a
                    ref={buttonRef(index)}
                    className={className}
                    href={item.url}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    tabIndex={index === cursor ? 0 : -1}
                    onClick={() => handleClick(item, index)}
                  >
                    {cursorMark}
                    {item.name}
                    {item.external && <span className="visually-hidden"> (opens in a new tab)</span>}
                  </a>
                )}
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
