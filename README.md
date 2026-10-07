# Navin's Battle Portfolio

A personal portfolio styled as a pixel-art Pokémon trainer battle. You play Navin against a Recruiter, and the battle menu is the navigation. Built for the NOBE Tech Committee capstone.

## Setup
Requires Node.js 20 or newer.

```
npm install
npm run dev
```

Open http://localhost:5173/NOBE-Capstone-Portfolio/

## Test, lint, build
```
npm test
npm run lint
npm run build
```

## Deployment
Live site: https://navparthiban.github.io/NOBE-Capstone-Portfolio/

[![CI](https://github.com/navparthiban/NOBE-Capstone-Portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/navparthiban/NOBE-Capstone-Portfolio/actions/workflows/ci.yml)

GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests, and build on every pull request. The `check` job must pass before a PR can merge into main. When main is updated, the same checks run again and then the site deploys to GitHub Pages automatically. If a check fails, nothing is deployed.

## AI use and limitations
Claude Code (an AI assistant) helps plan and write parts of this project. Navin reviews and approves every plan and change. The project is in early development, so most features are not built yet.

## Project Docs
- [CLAUDE.md](CLAUDE.md)
- [PRD.md](PRD.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
