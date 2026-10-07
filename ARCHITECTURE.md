# Architecture

## Folder layout
```
src/
  main.jsx             entry point, mounts App
  App.jsx              renders BattleScreen inside the GameFrame
  index.css            global reset, page background, pixel font
  logic/               plain JS functions, no React
    battle.js          battle and menu state, and the rules (see below)
    battle.test.js
    frame.js           works out the game frame's size and font size
    frame.test.js
  hooks/
    useTypewriter.js   reveals message text one character at a time
    useMenuFocus.js    keeps browser focus on the button at the cursor
    useFrame.js        the frame's orientation (landscape or portrait), shared with the screens
    useFileAvailable.js  checks whether a file exists on the site (used for the resume)
  components/          React components
    GameFrame.jsx      the fixed-ratio frame, centered and scaled to the window
    BattleScreen.jsx   runs the battle reducer and decides which screen to show
    BattleScreen.css   all styling
    BattleMenu.jsx     the menu buttons (main, move, or rematch)
    TextBox.jsx        typewriter message box, advances the message queue
    PokemonStatus.jsx  name and level above an HP bar
    HpBar.jsx          the HP bar, used by the battle and the party screens
    Sprite.jsx         sprite image or placeholder box
    PartyScreen.jsx    the party grid, with the "Choose a Pokémon." text box and CANCEL
    PartySummary.jsx   one Pokémon's summary
    BagScreen.jsx      the bag: item links, description text box, and CANCEL
    BattleScreen.test.jsx, PartySummary.test.jsx, GameFrame.test.jsx, BagScreen.test.jsx
  data/
    bag.js             the bag items (resume, GitHub, LinkedIn, email): name, description, link
    bag.test.js
    moves.js           Navin's four moves: name, damage, message
    party.js           Navin's six Pokémon (projects and experiences)
    pokemon.js         the Recruiter's team of three
    party.test.js
  test/setup.js        test setup (jest-dom matchers, cleanup)
```

## How battle state works
All rules live in `src/logic/battle.js` as plain functions. The whole battle is one object:

```js
{
  menu: 'main' | 'fight' | 'party' | 'summary' | 'bag' | 'victory',  // which screen and options are showing
  cursor: 0,                           // highlighted option
  queue: [{ text, changes }, ...],     // messages waiting to be read; queue[0] is on screen
  party: [ ...Navin's six Pokémon, each with its current hp ],
  lead: 0,                             // which party Pokémon is fighting
  selected: 0,                         // which party Pokémon's summary is open
  team: [ ...three Recruiter Pokémon, each with its own hp and attack ],
  active: 0,                           // which Recruiter Pokémon is on the field
}
```

- `createBattle()` builds the starting state: everyone at full HP, intro messages queued. `getLead(state)` returns the party Pokémon that is fighting.
- `battleReducer(state, action)` is the one entry point for changes. It never changes the old state; it returns a new one. Actions:
  - `cursor` (arrow key): moves the cursor with `moveCursor`, which stops at the edges. The main and move menus are a 2-column grid, the party screen is a 2-column grid (or 1 column, see below), and the summary has one column.
  - `select` (Enter or click): FIGHT opens the move menu, a move calls `takeTurn`, PARTY opens the party grid, a party Pokémon opens its summary, BACK or CANCEL goes back, REMATCH calls `createBattle()`. BAG opens the bag, and selecting a bag item only moves the cursor to it (the link itself is handled by the browser). RUN queues a placeholder message.
  - `back` (Escape): goes back one screen. Move menu to main, party grid to main (cursor on PARTY), bag to main (cursor on BAG), and summary to the party grid (cursor on that Pokémon). On the main menu it does nothing.
  - `advance`: removes the message on screen from the queue, then applies the changes of the next message.
- While `queue` has messages, the reducer ignores everything except `advance`, so the visitor reads each message before acting.
- `takeTurn(state, moveIndex)` plays one turn: the move hits (opponent HP stops at 0), then either the opponent faints (next one is sent out, or victory if it was the last) or it attacks back (the lead's HP stops at 1). It queues a message for each step. After victory it does nothing.
- Each queued message carries the `changes` that go with it: the move message lowers the opponent's HP, the counterattack message lowers the lead's HP in `party`, and "Recruiter sent out HIREMON!" switches `active`. A change is applied when its message comes on screen, so the HP bars and the Pokémon on the field always match what the text box says. By the time the queue is empty, the state is the same as if everything had happened at once.

## How the components use it
```
key / click -> BattleScreen -> dispatch(action) -> battleReducer -> new state -> re-render
```
- `BattleScreen` calls `useReducer(battleReducer, null, createBattle)` and passes pieces of the state down. It turns key presses into actions: arrows to `cursor`, Escape to `back`.
- It shows one of three things, based on `state.menu`: `PartyScreen` for `party`, `PartySummary` for `summary`, and otherwise the battle field with the text box and menu.
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
- The description text box shows the highlighted item's `description`.
- The resume file is added by hand as `public/resume.pdf`, so it may not exist. `useFileAvailable` sends a `HEAD` request for it. If the answer is not OK, or is not a PDF, `BagScreen` draws RESUME as a muted `aria-disabled` button and shows the item's `missingMessage` instead. The PDF check matters because the dev server answers a missing file with the home page and a 200. If the request itself fails (for example offline), the file is assumed to exist, so a good link is never hidden by mistake.
- When RESUME changes between a link and a button, the element is replaced, so `useMenuFocus` takes an extra value to re-focus the cursor's item. Without it, keyboard focus would be lost.
- `PartyScreen` and `BagScreen` share the `screen__footer` and `screen__cancel` styles for the text box with CANCEL along the bottom.

## The game frame
Everything the visitor sees sits inside one frame with a fixed aspect ratio, centered in the window, so every screen is the same size.

- `computeFrame` in `src/logic/frame.js` is a plain function. Given the window size and device pixel ratio, it returns the frame's width and height, its orientation, and a font size.
  - Landscape (wider than tall) is a 4:3 frame, and portrait is 3:4. The frame is as large as fits, so on a phone held upright it uses the full width.
  - The size is rounded to whole device pixels, so the edges stay sharp.
  - The font size is the largest multiple of 8 device pixels that lets the layout (40 characters across in landscape, 30 in portrait) fit. Press Start 2P is drawn on an 8-pixel grid, so those sizes render without blur.
- `GameFrame` listens for window resizes, calls `computeFrame`, and centers a frame of exactly that size with that font size. It gives the orientation to the screens through `FrameContext` (`useFrame`). `App.jsx` wraps `BattleScreen` in it.
- Nothing is scaled with CSS `transform` or viewport units, because those blur pixel fonts. The frame really is that size, and the text really is that size.
- In `BattleScreen.css` every size is in `em`, so the whole layout scales with the frame's font size. Every screen fills the frame: the battle field takes the leftover height above the text box, the party grid shares the height evenly, and the summary pins BACK to the bottom. The portrait layout is chosen by the frame's `data-orientation`, not by a media query.
- The battle sprites are sized with container query units, as the smaller of a height-based and a width-based limit, so they fit whatever shape the field is.

## Adding SWITCH later
The summary screen builds its buttons from `getMenuOptions('summary')`, which is `['BACK']` today. To add switching, put `'SWITCH'` in that list, handle it in `selectOption` in `battle.js` by changing `lead`, and nothing in the components has to change.

## Editing content
- Change move names, damage, or messages in `src/data/moves.js`.
- Change the party (names, levels, HP, experience, type, role, dates, description) in `src/data/party.js`. `type`, `role`, `dates`, and `description` are optional, and the summary leaves out whichever are missing. The RUN page can import this same file later.
- Change the bag items, links, and descriptions in `src/data/bag.js`. The resume is the file `public/resume.pdf`.
- Change the Recruiter's Pokémon and attacks in `src/data/pokemon.js`.
- To add real sprites, put the images in `src/assets/sprites/`, import them in the data file, and set each Pokémon's `sprite`.

## Testing
- `battle.test.js` tests the logic directly: damage, fainting and sending out the next Pokémon, victory, HP limits, no moves after victory, rematch, menus, cursor edges, and the party screens.
- `party.test.js` checks that the party data has six unique Pokémon with the fields the screens need.
- `BattleScreen.test.jsx` plays the real screen with fake timers: the intro, typing and advancing, menus with arrows and Escape, a full battle to victory, Rematch, and the party list and summaries.
- `bag.test.js` checks the bag data: four unique items with the exact links.
- `BagScreen.test.jsx` stubs `fetch` and checks each link, the new-tab attributes, the descriptions, and the resume cases: found, 404, a non-PDF answer, and a failed request.
- `PartySummary.test.jsx` checks that a Pokémon with missing optional fields still renders.
