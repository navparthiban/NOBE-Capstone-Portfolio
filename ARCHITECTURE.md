# Architecture

## Folder layout
```
src/
  main.jsx             entry point, mounts App
  App.jsx              picks the game or the plain portfolio; the game is the intro, then the battle, inside the GameFrame
  index.css            global reset, page background, pixel font
  logic/               plain JS functions, no React
    battle.js          battle and menu state, and the rules (see below)
    battle.test.js
    frame.js           works out the game frame's size and font size
    frame.test.js
    intro.js           the intro's steps: advance, skip, and when it is done
    intro.test.js
    route.js           which view the address asks for (game or portfolio)
    route.test.js
    links.js           the link attributes shared by the bag and the portfolio
    links.test.js
  hooks/
    useTypewriter.js   reveals message text one character at a time
    useMenuFocus.js    keeps browser focus on the button at the cursor
    useFrame.js        the frame's orientation (landscape or portrait), shared with the screens
    useFileAvailable.js  checks whether a file exists on the site (used for the resume)
    useView.js         the current view, kept in sync with the address hash, plus open and close
  components/          React components
    GameFrame.jsx      the fixed-ratio frame, centered and scaled to the window
    BattleScreen.jsx   runs the battle reducer and decides which screen to show
    BattleScreen.css   all styling
    BattleMenu.jsx     the menu buttons (main or move)
    TextBox.jsx        typewriter message box, advances the message queue
    PokemonStatus.jsx  name and level above an HP bar
    HpBar.jsx          the HP bar, used by the battle and the party screens
    Sprite.jsx         sprite image or placeholder box, with the recall and send-out animation
    PartyScreen.jsx    the party grid, the small SWITCH / SUMMARY / CANCEL menu, and the text box with CANCEL
    PartySummary.jsx   one Pokémon's summary
    BagScreen.jsx      the bag: item links, description text box, and CANCEL
    BadgeScreen.jsx    the badge, its name, a text box, and CONTINUE
    IntroScreen.jsx    the Professor intro, with the typewriter text box, SKIP, and Escape
    PortfolioPage.jsx  the plain portfolio page
    Portfolio.css      its styling (separate from the game)
    BattleScreen.test.jsx, PartySummary.test.jsx, GameFrame.test.jsx, BagScreen.test.jsx, IntroScreen.test.jsx, PortfolioPage.test.jsx
    ../App.test.jsx    the intro to battle hand-off, RUN, and the hash URL
  data/
    bag.js             the bag items (resume, GitHub, LinkedIn, email): name, description, link
    badge.js           the badge (name, image, prompt) and the dialogue after winning
    badge.test.js
    bag.test.js
    intro.js           the Professor and the lines of dialogue
    moves.js           Navin's four moves: name, damage, message
    party.js           Navin's six Pokémon (projects and experiences)
    pokemon.js         the Recruiter's team of three
    profile.js         the portfolio's name, tagline, and About text
    party.test.js
  test/setup.js        test setup (jest-dom matchers, cleanup)
```

## How battle state works
All rules live in `src/logic/battle.js` as plain functions. The whole battle is one object:

```js
{
  menu: 'main' | 'fight' | 'party' | 'partyMenu' | 'summary' | 'bag' | 'badge',  // which screen and options are showing
  cursor: 0,                           // highlighted option
  queue: [{ text, changes }, ...],     // messages waiting to be read; queue[0] is on screen
  party: [ ...Navin's six Pokémon, each with its current hp ],
  lead: 0,                             // which party Pokémon is fighting
  selected: 0,                         // which party Pokémon's small menu or summary is open
  team: [ ...three Recruiter Pokémon, each with its own hp and attack ],
  active: 0,                           // which Recruiter Pokémon is on the field
  fx: { player, opponent },            // 'hidden' | 'recall' | 'sendout' | 'faint': what each side's sprite is doing
  mustSwitch: false,                   // true after Navin's Pokémon faints, until a new one is chosen
}
```

- `createBattle()` builds the starting state: everyone at full HP, three intro messages queued, and both sides off the field. `getLead(state)` returns the party Pokémon that is fighting.
- `battleReducer(state, action)` is the one entry point for changes. It never changes the old state; it returns a new one. Actions:
  - `cursor` (arrow key): moves the cursor with `moveCursor`, which stops at the edges. The main and move menus are a 2-column grid, the party screen is a 2-column grid (or 1 column, see below), and the summary has one column.
  - `select` (Enter or click): FIGHT opens the move menu, a move calls `takeTurn`, PARTY opens the party grid, a party Pokémon opens its small menu (SWITCH, SUMMARY, CANCEL), SWITCH calls `switchLead`, SUMMARY opens the summary, BACK or CANCEL goes back. BAG opens the bag, and selecting a bag item only moves the cursor to it (the link itself is handled by the browser). RUN queues "Got away safely!" with `exit: 'portfolio'` (see the plain portfolio section).
  - `back` (Escape): goes back one screen. Move menu to main, small menu to the party grid (cursor on that Pokémon), party grid to main (cursor on PARTY), bag to main (cursor on BAG), and summary to the party grid (cursor on that Pokémon). On the main menu it does nothing.
  - `advance`: removes the message on screen from the queue, then applies the changes of the next message.
- While `queue` has messages, the reducer ignores everything except `advance`, so the visitor reads each message before acting.
- `takeTurn(state, moveIndex)` plays one turn: the move hits (opponent HP stops at 0), then either the opponent faints (next one is sent out, or the badge screen if it was the last) or it attacks back (the lead's HP stops at 1). It queues a message for each step. After victory it does nothing.
- Each queued message carries the `changes` that go with it: the move message lowers the opponent's HP, the counterattack message lowers the lead's HP in `party`, and "Recruiter sent out HIREMON!" switches `active`. A change is applied when its message comes on screen, so the HP bars and the Pokémon on the field always match what the text box says. By the time the queue is empty, the state is the same as if everything had happened at once.

## How the components use it
```
key / click -> BattleScreen -> dispatch(action) -> battleReducer -> new state -> re-render
```
- `BattleScreen` calls `useReducer(battleReducer, null, createBattle)` and passes pieces of the state down. It turns key presses into actions: arrows to `cursor`, Escape to `back`.
- It shows one of four things, based on `state.menu`: `PartyScreen` for `party` and `partyMenu`, `PartySummary` for `summary`, `BagScreen` for `bag`, and otherwise the battle field with the text box and menu.
- While messages are queued, `TextBox` shows `queue[0]` as a button and the menu is hidden. A click or Enter finishes the typing, and the next one dispatches `advance`. When the queue is empty, `TextBox` shows a prompt from `getPrompt(state)` and `BattleMenu` appears.
- `BattleMenu`, `PartyScreen`, and `PartySummary` all use `useMenuFocus`, which moves browser focus to the button at `cursor`. Only that button is in the Tab order.
- `useTypewriter` only controls how fast the text appears. It skips the animation if the visitor prefers reduced motion. Screen readers read the full message once from a hidden live region instead of letter by letter.
- `HpBar` calls `getHpPercent` to size the bar. `PokemonStatus` and the party rows both use it. The opponent shown is `team[active]` and Navin's is `getLead(state)`.

## How the party grid cursor works
- The six cards are cursor positions 0 to 5 in a 2-column grid, and CANCEL is position 6. CANCEL is drawn at the bottom right, so `moveCursor` takes an optional `rightAlignLast` flag that treats the last option as sitting in the last column. With the flag off, which is how the main and move menus use it, nothing changes.
- With the flag on: arrows move between neighboring cards, Down from either bottom card lands on CANCEL, Up from CANCEL goes to the bottom-right card, and every other move at an edge leaves the cursor where it is.
- When the frame is portrait (a phone held upright) the cards stack in one column. The cursor has to match what is drawn, or Down would skip a card, so `BattleScreen` reads the orientation from `useFrame` and sends the column count (1 or 2) with each arrow-key action. The reducer uses it for the party grid only.

## How the bag works
- `getMenuOptions('bag')` is the item names from `src/data/bag.js` plus CANCEL, in one column.
- `BagScreen` draws each item as a real link (`<a>`), so Enter and a click open it with no extra code. Web links get `target="_blank"` and `rel="noopener noreferrer"` plus hidden text saying they open in a new tab. The email link is a plain `mailto:`. Clicking an item also moves the cursor to it.
- The description text box shows the highlighted item's `description`. EMAIL's description includes the address itself, since a `mailto:` link does nothing on a computer with no mail app.
- An item with `copyText` (only EMAIL) also copies that text to the clipboard when clicked, and the text box then shows its `copiedMessage`. If the browser has no clipboard or refuses, nothing changes and the address stays visible.
- The bag's footer uses `screen__footer--tall` so the address fits on its own line without breaking.
- The resume file is added by hand as `public/resume.pdf`, so it may not exist. `useFileAvailable` sends a `HEAD` request for it. If the answer is not OK, or is not a PDF, `BagScreen` draws RESUME as a muted `aria-disabled` button and shows the item's `missingMessage` instead. The PDF check matters because the dev server answers a missing file with the home page and a 200. If the request itself fails (for example offline), the file is assumed to exist, so a good link is never hidden by mistake.
- When RESUME changes between a link and a button, the element is replaced, so `useMenuFocus` takes an extra value to re-focus the cursor's item. Without it, keyboard focus would be lost.
- `PartyScreen` and `BagScreen` share the `screen__footer` and `screen__cancel` styles for the text box with CANCEL along the bottom.

## How the intro works
- `App.jsx` keeps one flag, `introDone`. It shows `IntroScreen` until that screen calls `onDone`, then `BattleScreen`. The battle code does not know the intro exists, and the battle is not touched by it. The trainer is always NAVIN (the battle messages already say "Navin"), so no name is stored.
- `src/logic/intro.js` holds the rules as plain functions. The state is `{ index, count, done }`. `introReducer(state, action)` takes `advance` (next line, and done after the last one) or `skip` (done from any line). Once done, it stays done. `getIntroLine(state, lines)` gives the line to show, and `MAX_LINE_LENGTH` is the longest line allowed.
- `IntroScreen` keeps that state with `useState` and runs every action through `introReducer`. When the result is done, it calls `onDone()`. It reuses `TextBox` (typewriter, Enter or click finishes a line that is still typing, focus on the button) and `Sprite` with no image for the Professor, inside the same `.field` and `.panel` styles as the battle, so it fits the same frame.
- SKIP is a normal button in the corner (`.intro__skip`, placed after the text box so Tab goes to it next). Escape is a listener on `window`, added in an effect and removed when the intro goes away, so it works wherever the focus is and can never reach the battle. The SKIP button has `aria-keyshortcuts="Escape"`.
- With reduced motion on, the typewriter already shows each full line at once.

## How the badge screen works
- The final knockout in `takeTurn` queues "Recruiter has no Pokémon left!", "Navin won the battle!", and then the lines in `badgeLines` (`src/data/badge.js`), and sets `menu: 'badge'`. This is the only place that menu is set, so it can only be reached by winning. Its one option is CONTINUE.
- In the reducer, `back`, `cursor`, and `select` do nothing on the badge menu, so Escape and the arrows are ignored. CONTINUE is not handled by the reducer, like RUN: `BadgeScreen`'s button calls `BattleScreen`'s `onWin` prop.
- `BattleScreen` keeps the field (with the messages) on screen while the badge lines are queued, then moves the field away and shows `BadgeScreen` once the queue is empty. `BadgeScreen` focuses CONTINUE with `useMenuFocus` and reuses the `screen__footer` styles.
- `App.jsx` has a `won` flag and a `battleKey`. `onWin` sets `won` and opens the portfolio, which gets `backLabel="Play again"`. Play again clears `won`, adds one to `battleKey`, and closes the portfolio. The new key remounts `BattleScreen`, which starts a fresh `createBattle()`, and `introDone` is still true, so the Professor does not come back. Through RUN, `won` stays false, so the label and the kept battle state are unchanged.
- `won` lives in memory only, so a reload or a direct `/#portfolio` link shows "Back to the game".

## How the plain portfolio works
- `App.jsx` asks `useView` which view to show. The address hash is the only source of truth: `getViewFromHash` in `src/logic/route.js` returns `'portfolio'` only for exactly `#portfolio`, and `'game'` for anything else. `useView` listens for `hashchange` and `popstate`, so the browser's Back and Forward buttons work with no router library.
- RUN is a normal battle message, `{ text: RUN_MESSAGE, exit: 'portfolio' }`. The reducer stays pure. `BattleScreen.advance()` calls its `onRun` prop when the message that was just dismissed has `exit === 'portfolio'`, and `App` passes `openPortfolio`, which sets the hash. The battle state is not touched, so the menu is still on RUN when the visitor comes back.
- **The game stays mounted while the portfolio is open.** `GameFrame` gets `away`, which gives the stage `stage--away` (zero size, `visibility: hidden`) plus `aria-hidden` and `inert`. This is the same reason as `field--away`: unmounting would reset the battle, and `display: none` would restart the Pokéball animations. `App` only mounts the game once the visitor has been in it (`started`), so opening `/#portfolio` directly never builds the intro in the background, and "Back to the game" from there starts the intro.
- `IntroScreen` takes `active`. Its Escape listener ignores keys while the portfolio is showing, so Escape on the portfolio cannot skip an intro hidden behind it.
- `closePortfolio` calls `history.back()` if the portfolio was opened from the game (so the history stays tidy), and otherwise replaces the address with the one without a hash. On return, `App` focuses the text box button or the option at the cursor.
- `PortfolioPage` takes its content as props that default to the data files: `profile` (`profile.js`), `experiences` (`party.js`), `skills` (`moves.js`), and `links` (`bag.js`). While it is open it sets the page title, adds `body--light` (so the area around the page matches), scrolls to the top, and focuses the main heading, then undoes all of that when it closes.
- Link attributes come from `getLinkProps` in `src/logic/links.js`, shared with `BagScreen`. The portfolio does not use in-page `#` links, because they would collide with the hash routing.
- `Portfolio.css` is separate from the game styles. It uses `rem`, so it follows the visitor's font size. The two fonts load from Google Fonts in `index.html`.

## The game frame
Everything the visitor sees sits inside one frame with a fixed aspect ratio, centered in the window, so every screen is the same size.

- `computeFrame` in `src/logic/frame.js` is a plain function. Given the window size and device pixel ratio, it returns the frame's width and height, its orientation, and a font size.
  - Landscape (wider than tall) is a 4:3 frame, and portrait is 3:4. The frame is as large as fits, so on a phone held upright it uses the full width.
  - The size is rounded to whole device pixels, so the edges stay sharp.
  - The font size is the largest multiple of 8 device pixels that lets the layout (40 characters across in landscape, 30 in portrait) fit. Press Start 2P is drawn on an 8-pixel grid, so those sizes render without blur.
- `GameFrame` listens for window resizes, calls `computeFrame`, and centers a frame of exactly that size with that font size. It gives the orientation to the screens through `FrameContext` (`useFrame`). `App.jsx` wraps the intro and the battle in it.
- Nothing is scaled with CSS `transform` or viewport units, because those blur pixel fonts. The frame really is that size, and the text really is that size.
- In `BattleScreen.css` every size is in `em`, so the whole layout scales with the frame's font size. Every screen fills the frame: the battle field takes the leftover height above the text box, the party grid shares the height evenly, and the summary pins BACK to the bottom. The portrait layout is chosen by the frame's `data-orientation`, not by a media query.
- The battle sprites are sized with container query units, as the smaller of a height-based and a width-based limit, so they fit whatever shape the field is.

## How switching works
- Selecting a party Pokémon opens `partyMenu`, whose options are `SWITCH`, `SUMMARY`, `CANCEL` in one column. `PartyScreen` draws it as a small box over the grid, and the other cards ignore clicks while it is open.
- `switchLead(state, index)` in `battle.js` is a plain function. It does nothing after victory (`isOver`) or outside the small menu. For the Pokémon already in battle it queues one message and returns to the party grid. Otherwise it queues three messages and returns to the main menu:
  1. "Come back, PORYGON!", with `fx.player = 'recall'`
  2. "Go, ALAKAZAM!", with `lead` changed and `fx.player = 'sendout'`
  3. The Recruiter's attack on the new Pokémon, which lowers only that Pokémon's HP (see the fainting section below)
- Because `changes` apply when their message appears, the old Pokémon stays on screen through message 1, and the new one, with its name, level, and HP, only appears with message 2. HP lives in `party`, so each Pokémon keeps its own.
- The party screen shows queued messages in its text box (for "already in battle") and advances them like the battle screen. `useMenuFocus` gets a version value so focus returns to the grid when the message is gone.
- `createBattle()` (used when Play again starts a new battle) restores all HP, sets `lead` back to 0, and sets `fx` back to both sides hidden, so the battle intro plays again.

## How fainting and forced switching work
- `counterattack(state, targetIndex)` builds the Recruiter's attack messages for both a normal turn and a switch. The target loses HP down to 0, unless it is the last Pokémon with HP left, in which case it stops at 1 (so the visitor can't lose). If the target reaches 0, a second message "PORYGON fainted!" follows. Its `changes` set `fx.player = 'faint'` and `mustSwitch = true`, so they only apply when that message is on screen.
- `advance` calls `openForcedParty` after each message. When the queue is empty and `mustSwitch` is set, it opens `party` with the cursor on the first Pokémon that can fight. So the faint message plays on the battle field first, then the party opens.
- While `mustSwitch` is set: `goBack` ignores the party grid (so Escape and CANCEL do nothing), and the cursor action leaves CANCEL out of the count so the cursor can't reach it. `PartyScreen` gets `forced`, which changes the prompt and leaves out the CANCEL button. The small menu and summary work as usual.
- `switchLead` first refuses a Pokémon with 0 HP ("has no energy left!"). When `mustSwitch` is set, it queues only "Go, ...!" and clears `mustSwitch`, with no recall and no counterattack.
- `BattleScreen` leaves out the player's status box while `fx.player` is `'faint'`. `Sprite` plays a short sink-and-fade animation for `'faint'` (only the Pokéball is limited to recall and send-out). With reduced motion, the sprite is just hidden.
- In the party, a Pokémon with 0 HP gets the `party__card--fainted` class (grey background) and "fainted" in its accessible name.
- The Recruiter's attack damage is in `src/data/pokemon.js`: tune it there if the battle feels too easy or too hard.

## How the animations work
- `state.fx` is `{ player, opponent }`, each `'hidden'`, `'recall'`, `'sendout'`, or `'faint'`. Like HP, a value is set by the message it belongs to. The battle starts with both `'hidden'`, and `BattleScreen` leaves out a hidden side's sprite and status box. The intro's "Recruiter sent out SCREENMON!" message sets `fx.opponent = 'sendout'`, and "Go, PORYGON!" sets `fx.player = 'sendout'`, which is what makes each side appear with its own message. `takeTurn` sets `fx.opponent = 'sendout'` on "Recruiter sent out HIREMON!", so the Recruiter's replacements reuse the same animation.
- `BattleScreen` passes each side's `fx` to `Sprite`, with a `key` of the Pokémon's name plus its `fx`, so a new animation always starts fresh. `Sprite` sets `data-fx`, and wraps the image in `.sprite__body` with a `.sprite__ball` (the Pokéball SVG) beside it.
- All the motion is CSS keyframes in `BattleScreen.css` (`recall`, `ball-in`, `grow`, `ball-out`). Recall ends with the sprite scaled to 0 and stays that way until the next message replaces it.
- The battle field stays mounted while PARTY, BAG, or a summary is open. It is only moved out of the way (`field--away`: zero size, `visibility: hidden`, `aria-hidden`, `inert`). Removing it, or using `display: none`, would restart every CSS animation when the visitor came back, so the Pokéballs would send the Pokémon out again with nothing new happening. jsdom does not run CSS animations, so the tests check that the sprites are the very same elements after a visit, and the no-replay behavior itself was checked in a real browser.
- With reduced motion on, a media query turns the animations off and hides the ball, so the sprite just swaps. Logic tests check `fx` and the order of changes, because jsdom does not run CSS animations. The animation timing itself was checked in a real browser.

## Editing content
- Change move names, damage, or messages in `src/data/moves.js`. The move menu is two columns in a fixed-width box (`grid-template-columns` on `.panel` in `BattleScreen.css`, 22em), sized so that "TypeScript" fits on one line. If you add a longer move name, widen that column a little or the name will break across two lines.
- Change the party (names, levels, HP, experience, type, role, dates, description) in `src/data/party.js`. `type`, `role`, `dates`, and `description` are optional, and the summary leaves out whichever are missing. The plain portfolio uses this same file for its Experience section.
- Change what the Professor says in `src/data/intro.js`, one string per message. Keep each line to 100 characters or fewer; the data test fails otherwise. The text box fits at least about 6 lines of 24 characters even on a small phone, so a 100-character line always fits, and a longer one should be split into two entries. To use a real image for the Professor, import it there and set `professor.sprite`.
- Change the badge dialogue, the badge name, and the text on the badge screen in `src/data/badge.js`. Keep each line to 100 characters or fewer (a test checks). To use a real badge image, import it there and set `badge.image`.
- Change the bag items, links, and descriptions in `src/data/bag.js`. The resume is the file `public/resume.pdf`. The portfolio's Links section uses the same items.
- Change the portfolio's name, tagline, and About paragraphs (one string each) in `src/data/profile.js`. Its Skills come from `src/data/moves.js`.
- Change the Recruiter's Pokémon and attacks in `src/data/pokemon.js`.
- To add real sprites, put the images in `src/assets/sprites/`, import them in the data file, and set each Pokémon's `sprite`.

## Testing
- `battle.test.js` tests the logic directly: damage, fainting and sending out the next Pokémon, victory, HP limits, no moves after victory, the badge menu, menus, cursor edges, and the party screens.
- `party.test.js` checks that the party data has six unique Pokémon with the fields the screens need.
- `BattleScreen.test.jsx` plays the real screen with fake timers: the intro, typing and advancing, menus with arrows and Escape, a full battle to the badge screen, and the party list and summaries.
- `bag.test.js` checks the bag data: four unique items with the exact links.
- `BagScreen.test.jsx` stubs `fetch` and checks each link, the new-tab attributes, the descriptions, copying the email address (including when the clipboard is refused or missing), and the resume cases: found, 404, a non-PDF answer, and a failed request.
- The switching tests (in `battle.test.js` and `BattleScreen.test.jsx`) cover the messages and their order, the Recruiter's attack after a switch, each Pokémon keeping its own HP, switching to the Pokémon already in battle, switching after victory, and the Recruiter's replacement not appearing before its message.
- The fainting tests (in `battle.test.js` and `BattleScreen.test.jsx`) cover fainting and its messages, the faint applying only with its message, the party opening by itself and refusing Escape, CANCEL and fainted Pokémon, a forced switch with no recall or attack, the last Pokémon able to fight staying at 1 HP, a full battle that still ends in the badge screen. In the logic tests, the `recover` helper plays through a forced switch so long battles can run to the end.
- `intro.test.js` checks the intro rules (advance, skip from every line, done stays done, no lines) and the dialogue data (12 lines, no stray spaces, none over `MAX_LINE_LENGTH`). `IntroScreen.test.jsx` and `App.test.jsx` check the screen: clicking through every line ends on the battle, SKIP and Escape from every line, Enter while a line is still typing finishing the line instead of skipping ahead, and the Escape listener being gone after the intro.
- `route.test.js` and `links.test.js` check the hash rule (exactly `#portfolio`, nothing else) and the link attributes. `PortfolioPage.test.jsx` checks that every experience, skill, and link appears with the right targets, the headings, the Back button being first in the tab order, experiences with missing optional fields, the resume cases, and the page title and background being restored. `App.test.jsx` checks RUN (the portfolio opens only after the message), that the game is hidden from assistive tech but still mounted, that Back keeps the HP, the active Pokémon, and the very same sprite elements, direct `/#portfolio` with no intro, and the browser's Back and Forward.
- The real-browser checks (headless Edge) covered the whole RUN round trip with no animations replaying, direct and reloaded `/#portfolio`, no horizontal scrolling from 320px to 1920px wide, and text contrast.
- The badge tests: `battle.test.js` checks the badge lines being queued after the victory messages, the badge menu ignoring Escape, arrows, and select, and that no menu path or earlier knockout reaches it. `badge.test.js` checks the data. `BattleScreen.test.jsx` plays a full battle through the badge dialogue to the badge screen and checks CONTINUE, Escape, and the placeholder or real image. `App.test.jsx` checks CONTINUE opening the portfolio with Play again, the fresh battle without the intro (every HP and the Recruiter reset), RUN and direct links still saying Back to the game, and the browser Back button.
- The real-browser check (headless Edge) played a full win at desktop, phone, and sideways phone sizes: the badge screen fits the frame, CONTINUE and Play again work by keyboard.
- `PartySummary.test.jsx` checks that a Pokémon with missing optional fields still renders.
