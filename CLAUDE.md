# CLAUDE.md

## About
Navin is a CS + Chemistry freshman at UIUC and a beginner. This is the NOBE Tech Committee capstone: a personal portfolio styled as a Pokémon trainer battle in pixel art. The visitor plays Navin against a Recruiter.

- FIGHT: skills shown as moves
- PARTY: six Pokémon, each a project or experience
- BAG: resume and links
- RUN: opens a plain version of the site
- Winning shows a badge screen with contact info

## Requirements
- Public GitHub repo, interactive feature with automated tests (normal use and edge cases)
- GitHub Actions on every PR: lint, test, build; passing checks required to merge
- Auto-deploy from main to the live site after checks pass
- Evidence of a failed check, its fix, and a main deployment
- README with setup, test, deploy steps and a note on AI use and limitations
- Keyboard-accessible battle menu (usability and accessibility are graded)
- Dates: technical checkpoint Oct 15, final links Oct 16, presentation Oct 17

## Preferences
- Plan every feature before coding and wait for approval
- Modular, simple code with minimal comments
- Battle logic in plain functions, separate from React components
- One-line commit messages, never a co-authored line
- After initial setup, all work goes on separate branches, never directly to main
- Briefly explain what each file does

## Stack and commands
React + Vite, plain CSS (no Tailwind), Vitest, ESLint. Vite base is `/NOBE-Capstone-Portfolio/`.

- `npm run dev` start locally
- `npm test` run tests
- `npm run lint` run ESLint
- `npm run build` production build

## Git workflow
Main is protected. For each feature: make a branch, commit, push, open a PR, wait for the `check` job to pass, then squash-merge. Merging to main deploys the site.
