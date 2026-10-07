# PRD

## Purpose
A portfolio site for Navin (NOBE Tech Committee capstone) where a visitor plays Navin in a pixel-art Pokémon-style battle against a Recruiter. The battle menu is the site navigation.

## Features
- FIGHT: skills as moves
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
- Win condition for the battle is not yet defined
