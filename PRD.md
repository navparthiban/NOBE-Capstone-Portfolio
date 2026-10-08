# PRD

## Purpose
A portfolio site for Navin (NOBE Tech Committee capstone) where a visitor plays Navin in a pixel-art Pokémon-style battle against a Recruiter. The battle menu is the site navigation.

## Features
- FIGHT: skills as moves (React, TypeScript, Java, Git). Built in step 4
- PARTY: six Pokémon, each a project or experience, with a grid and a summary screen. Built
- Pokémon switching, with Pokéball recall and send-out animations shared by Navin's switches and the Recruiter's replacements. Built
- BAG: resume and links. Built
- Intro where the Professor asks the visitor's name, then a transition into the battle
- Badge screen on winning, with contact info
- RUN: a plain, separate portfolio page, designed after the game is done

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
- After each move, the Recruiter's Pokémon attacks back for fixed damage, unless it just fainted: SCREENMON 10, HIREMON 12, OFFERMON 14.
- Navin's Pokémon can faint, but the last one still able to fight never drops below 1 HP, so the visitor cannot lose. Opponent HP never drops below 0.
- When a Recruiter Pokémon faints, the next one is sent out with a message.
- When all three faint, the battle shows a victory message and a REMATCH option that resets everything.
- Messages show one at a time with a typewriter effect. Enter or a click finishes the line, then moves to the next.
- Escape or BACK returns from the move menu to the main menu. RUN still shows a placeholder message.
- Navin's lead Pokémon in the battle is the first one in the party (PORYGON). Its HP lives in the party list, so the party screen always shows its current HP.

## Party
- PARTY opens a DS-style grid of Navin's six Pokémon, two per row. Each card shows a sprite box, name, level, HP bar, and HP numbers like 60/60. A text box along the bottom says "Choose a Pokémon.", with a CANCEL button at the bottom right.
- The selected card is highlighted with a blue border and background. When a phone is held upright, the grid becomes a single column.

## Switching
- PARTY, then a Pokémon, then SWITCH brings it into battle. The text box shows "Come back, PORYGON!", then "Go, ALAKAZAM!". Switching uses up the turn, so the Recruiter then attacks the new Pokémon with its usual fixed damage. The Recruiter's Pokémon takes no damage.
- Each Pokémon keeps its own HP, so switching away and back keeps it. The four moves are the same whichever Pokémon is active. The battle screen shows the active Pokémon's name, level, and HP numbers.
- SWITCH on the Pokémon already in battle only shows "PORYGON is already in battle!" and returns to the party grid.
- No switching after victory, because the victory screen only offers REMATCH. REMATCH restores every Pokémon's HP and puts the first one back in battle.

## Fainting and forced switching
- When a Pokémon of Navin's reaches 0 HP, the messages show the attack and then "PORYGON fainted!". Its sprite sinks out of view and its status box goes away.
- When the messages are done, PARTY opens by itself with "Bring out which Pokémon?". CANCEL is gone, Escape does nothing, and the cursor can't reach CANCEL, so the visitor has to choose a Pokémon that can still fight. The small menu and the summary still work.
- SWITCH then shows only "Go, ALAKAZAM!" with the normal send-out. There is no recall and no Recruiter attack after a forced switch, like the real games.
- Fainted Pokémon show 0 HP and are greyed out in the party. SWITCH on one, forced or not, shows "PORYGON has no energy left!" and changes nothing.
- A Pokémon can also faint right after a voluntary switch, if the attack that follows is enough to knock it out. That forces another switch.
- The last Pokémon able to fight never faints (it stays at 1 HP), so the visitor can't run out of Pokémon and the win stays guaranteed.

## Battle start
- The battle opens with an empty field: no sprites and no status boxes. "A Recruiter wants to battle!" shows first, then "Recruiter sent out SCREENMON!" sends out SCREENMON, and "Go, PORYGON!" sends out Navin's Pokémon. Each side, with its status box, only appears with its own message, using the same send-out animation. REMATCH replays this intro.

## Animations
- Recall: the Pokémon flashes and shrinks into a Pokéball. Send-out: a Pokéball appears, opens, and the Pokémon grows into place. The Recruiter's replacements use the same send-out.
- An animation only starts when its message appears, so a new Pokémon never shows before the text says it was sent out.
- With reduced motion on, the animations and the Pokéball are skipped and the sprite just swaps when the "Go" message appears.
- The Pokéball is a small pixel-art SVG in `src/assets/sprites/pokeball.svg`.

## Bag
- BAG opens a bag screen like the games': a bag picture box, a list of four items, and a text box along the bottom that describes the highlighted item, with CANCEL at the bottom right. It fills the same game frame as every other screen.
- Items, in `src/data/bag.js` (the RUN page can reuse them):
  - RESUME: `public/resume.pdf`, opens in a new tab
  - GITHUB: https://github.com/navparthiban, new tab
  - LINKEDIN: https://www.linkedin.com/in/navin-parthiban, new tab
  - EMAIL: `mailto:navparthiban@gmail.com`. The address is also written in its description ("Send Navin an email: navparthiban@gmail.com"), and clicking EMAIL copies it and says "Email address copied!", because a computer with no mail app does nothing with a `mailto:` link
- Items are real links, so Enter and a click open them. Web links use `target="_blank"` with `rel="noopener noreferrer"`, and screen readers hear "(opens in a new tab)".
- Arrow keys move through the items and CANCEL without wrapping. Escape or CANCEL returns to the main menu with the cursor on BAG.
- If `public/resume.pdf` is missing, RESUME still shows, but as a muted button, and the text box says "Resume isn't available yet." instead of linking to a broken page. If the check can't run (for example offline), RESUME stays a link.

## Game frame
- The whole game sits in one frame with a fixed aspect ratio, centered in the browser both ways: 4:3 on desktops, tablets, and phones held sideways, and 3:4 on phones held upright, where it uses the full width.
- The frame scales up to fill as much of the window as possible and resizes with it.
- Every screen (battle, move menu, party, summary) fills the same frame, so nothing changes size when switching screens.
- The pixel font stays crisp: its size is always a multiple of 8 device pixels, and nothing is blurred by CSS scaling.
- Selecting a Pokémon opens a small menu with SWITCH, SUMMARY, and CANCEL. SUMMARY opens its summary: experience, type label, role, dates, and a short description. Any optional field that is missing is left out.
- Arrow keys move through the grid in all four directions and stop at the edges without wrapping. Down from the bottom row reaches CANCEL, and Up from CANCEL returns to the card above it.
- Enter or a click selects. Escape or CANCEL goes back one screen: small menu to grid, summary to grid, then grid to the main menu. While the small menu is open, clicking the other cards does nothing.
- The summary screen has an options list (only BACK for now).
- The lineup is in `src/data/party.js`, which the RUN page can reuse later:
  - PORYGON: ClearSign, legal contract simplifier web app
  - ELECTRODE: SCARF research on inherited arrhythmias
  - ALAKAZAM: Mathnasium math instructor
  - MEOWTH: DECA marketing campaign, top 10 at state
  - CHANSEY: Edward Hospital volunteer
  - MAGNETON: NOBE Tech Committee, Lincoln Elementary project

## Deadlines
- Oct 15: technical checkpoint
- Oct 16: final links
- Oct 17: presentation

## Build order
Done: local project setup, GitHub repo and CI/CD pipeline, battle screen, battle logic and tests.

Next:
1. PARTY summaries (done)
2. BAG (done)
3. Pokémon switching plus Pokéball recall and send-out animations, shared by my switches and the Recruiter's replacements (done)
4. Intro with the Professor asking the visitor's name, the battle transition, and the badge screen
5. RUN as a plain, separate portfolio page, designed after the game is done

## Known gaps
- No real content yet (skills). `public/resume.pdf` has not been added, so RESUME shows the "not available yet" message until it is
- The GitHub and LinkedIn URLs in `src/data/bag.js` should be double-checked
- Party descriptions, roles, type labels, levels, and HP are starter text for Navin to rewrite, and no dates are filled in yet
- Pixel art and sprites not chosen
- A fainted Recruiter Pokémon stays on screen until its replacement is sent out (no faint animation)
- While the small menu is open on the party screen, it covers part of the bottom-right card
- Intro and badge screens are planned for step 4 and not built yet
- Screen-reader behavior of the pixel-style UI is untested
- Winning only shows a victory message and REMATCH; the badge screen is not built yet
- Move damage and Pokémon names are placeholders
- The PARTY descriptions still need to be rewritten in Navin's own words
- Reported by Navin: on phones held sideways, the party screen falls back to a single column. Not reproduced in an emulated 844×390 sideways phone (two columns there), so the cause is unknown
