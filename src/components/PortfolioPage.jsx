import { useEffect, useRef } from 'react'
import { RESUME_URL, bagItems } from '../data/bag.js'
import { moves } from '../data/moves.js'
import { party } from '../data/party.js'
import { profile as defaultProfile } from '../data/profile.js'
import useFileAvailable from '../hooks/useFileAvailable.js'
import { getLinkProps } from '../logic/links.js'
import './Portfolio.css'

function Experience({ pokemon }) {
  const meta = [pokemon.role, pokemon.dates].filter(Boolean).join(' · ')

  return (
    <article className="portfolio__card">
      <h3>{pokemon.experience}</h3>
      {pokemon.type && <span className="portfolio__type">{pokemon.type}</span>}
      {meta && <p className="portfolio__meta">{meta}</p>}
      {pokemon.description && <p>{pokemon.description}</p>}
      <p className="portfolio__tag" aria-hidden="true">
        {pokemon.name} in the game
      </p>
    </article>
  )
}

function LinkItem({ item, missing }) {
  return (
    <li className="portfolio__link-item">
      {missing ? (
        <span className="portfolio__link-name">{item.name}</span>
      ) : (
        <a className="portfolio__link-name" {...getLinkProps(item)}>
          {item.name}
          {item.external && <span className="visually-hidden"> (opens in a new tab)</span>}
        </a>
      )}
      <p>{missing ? item.missingMessage : item.description}</p>
      {!missing && item.copyText && <p className="portfolio__address">{item.copyText}</p>}
    </li>
  )
}

export default function PortfolioPage({
  onBack,
  backLabel = 'Back to the game',
  profile = defaultProfile,
  experiences = party,
  skills = moves,
  links = bagItems,
}) {
  const heading = useRef(null)
  const resumeAvailable = useFileAvailable(RESUME_URL, 'pdf')

  useEffect(() => {
    const previousTitle = document.title
    document.title = `${profile.name} | Portfolio`
    document.body.classList.add('body--light')
    window.scrollTo(0, 0)
    heading.current?.focus({ preventScroll: true })
    return () => {
      document.title = previousTitle
      document.body.classList.remove('body--light')
    }
  }, [profile.name])

  return (
    <div className="portfolio">
      <header className="portfolio__header">
        <button type="button" className="portfolio__back" onClick={onBack}>
          {backLabel}
        </button>
        <h1 ref={heading} tabIndex={-1}>
          {profile.name}
        </h1>
        <p className="portfolio__tagline">{profile.tagline}</p>
      </header>
      <main className="portfolio__main">
        <section aria-labelledby="portfolio-about">
          <h2 id="portfolio-about">About</h2>
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
        <section aria-labelledby="portfolio-experience">
          <h2 id="portfolio-experience">Experience</h2>
          <ul className="portfolio__cards">
            {experiences.map((pokemon) => (
              <li key={pokemon.name}>
                <Experience pokemon={pokemon} />
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="portfolio-skills">
          <h2 id="portfolio-skills">Skills</h2>
          <ul className="portfolio__skills">
            {skills.map((skill) => (
              <li key={skill.name}>{skill.name}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="portfolio-links">
          <h2 id="portfolio-links">Links and resume</h2>
          <ul className="portfolio__links">
            {links.map((item) => (
              <LinkItem key={item.name} item={item} missing={item.missingMessage !== undefined && !resumeAvailable} />
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
