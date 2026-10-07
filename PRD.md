# PRD

## Purpose
A portfolio site for Navin (NOBE Tech Committee capstone) where a visitor plays Navin in a pixel-art Pokémon-style battle against a Recruiter. The battle menu is the site navigation.

## Features
- FIGHT: skills as moves (React, TypeScript, Java, Git). Built in step 4
- PARTY: six Pokémon, each a project or experience, with a short summary
- BAG: resume and links
- RUN: plain, non-game version of the site
- Badge screen on winning, with contact info
- Intro screen (stretch goal)

## Requirements
- Public GitHub repo
- Interactive battle feature with automated tests for normal use and edge cases
- GitHub Actions on every PR runs lint, tests, build; passing checks required to merge
- Auto-deploy from main to GitHub Pages after checks pass
- Evidence: a failed check, its corrected passing run, and a main deployment
- README with setup, test, deployment, AI use and limitations
- Accessible: full keyboard control of the battle menu, visible focus, readable contrast

## Battle rules
- The Recruiter has three Pokémon, sent out one at a time. Navin's Pokémon starts at full HP.
- Each move deals fixed damage (no randomness). Move names, damage, and messages are in `src/data/moves.js`; the Pokémon are in `src/data/pokemon.js`.
- After each move, the Recruiter's Pokémon attacks back for small fixed damage, unless it just fainted.
- Navin's Pokémon never drops below 1 HP, so the visitor cannot lose. Opponent HP never drops below 0.
- When a Recruiter Pokémon faints, the next one is sent out with a message.
- When all three faint, the battle shows a victory message and a REMATCH option that resets everything.
- Messages show one at a time with a typewriter effect. Enter or a click finishes the line, then moves to the next.
- Escape or BACK returns from the move menu to the main menu. BAG, PARTY, and RUN still show placeholder messages.

## Deadlines
- Oct 15: technical checkpoint
- Oct 16: final links
- Oct 17: presentation

## Build order
1. Local project setup
2. GitHub repo and CI/CD pipeline
3. Battle screen with the four buttons and text box
4. Battle logic and tests
5. PARTY summaries, BAG links, and the RUN page
6. Intro and badge screen if time allows

## Known gaps
- No real content yet (skills, projects, resume, links)
- Pixel art and sprites not chosen
- Intro and badge screens are stretch goals
- Screen-reader behavior of the pixel-style UI is untested
- Winning only shows a victory message and REMATCH; the badge screen is not built yet
- Move damage and Pokémon names are placeholders
