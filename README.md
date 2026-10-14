# Navin's Battle Portfolio
This is a personal portfolio which is styled as a pixel-art Pokemon trainer battle. You will be playing me (Navin) against a recruiter, and you will be taught how to navigate the site as soon as you enter. If you wish to immediately get to a plain-view of the portfolio, all you need to do is press SKIP during the Professor's intro, and then hit "RUN" at the bottom right of the screen. 

Fastest way to get to the plain-view of the portfolio: https://navparthiban.github.io/NOBE-Capstone-Portfolio/#portfolio

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
I used Claude Code to plan and write most of the code for this project. My role was to decide what to build, write the prompts for each feature, review every plan Claude generated before it started, and test each change in the browser before merging. All the ideas behind the site, like the battle menu as navigation and each Pokemon standing for one of my experiences, are mine. I wrote the README intro, this section, and the experience descriptions myself. 

Claude Code did have real limitations. When I asked Claude Code to change a message timing, it ended up breaking the battle function so the Recruiter's next Pokemon never came out even though every test still technically passed. I was able to catch this mistake by playing the game myself, and I had Claude Code include a new test so this wouldn't be able to happen again. I'm still learning parts of the codebase (battle logic, etc.), and I'm working through understanding it before presenting. 

## Project Docs
- [CLAUDE.md](CLAUDE.md)
- [PRD.md](PRD.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
