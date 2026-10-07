# Architecture

## Folder layout
```
src/
  main.jsx             entry point, mounts App
  App.jsx              renders BattleScreen
  index.css            global reset, page background, pixel font
  logic/               plain JS functions, no React
    battle.js          battle and menu state, and the rules (see below)
    battle.test.js
  hooks/
    useTypewriter.js   reveals message text one character at a time
    useMenuFocus.js    keeps browser focus on the button at the cursor
  components/          React components
    BattleScreen.jsx   runs the battle reducer and decides which screen to show
    BattleScreen.css   all styling
    BattleMenu.jsx     the menu buttons (main, move, or rematch)
    TextBox.jsx        typewriter message box, advances the message queue
    PokemonStatus.jsx  name and level above an HP bar
    HpBar.jsx          the HP bar, used by the battle and the party screens
    Sprite.jsx         sprite image or placeholder box
    PartyScreen.jsx    the party list
    PartySummary.jsx   one Pokémon's summary
    BattleScreen.test.jsx, PartySummary.test.jsx
  data/
    moves.js           Navin's four moves: name, damage, message
    party.js           Navin's six Pokémon (projects and experiences)
    pokemon.js         the Recruiter's team of three
    party.test.js
  test/setup.js        test setup (jest-dom matchers, cleanup)
```
Still planned: bag and resume content in `src/data/`.

## How battle state works
All rules live in `src/logic/battle.js` as plain functions. The whole battle is one object:

```js
{
  menu: 'main' | 'fight' | 'party' | 'summary' | 'victory',  // which screen and options are showing
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
  - `cursor` (arrow key): moves the cursor with `moveCursor`, which stops at the edges. The party and summary lists have one column, so only up and down do anything there.
  - `select` (Enter or click): FIGHT opens the move menu, a move calls `takeTurn`, PARTY opens the party list, a party Pokémon opens its summary, BACK goes back, REMATCH calls `createBattle()`. BAG and RUN queue a placeholder message.
  - `back` (Escape): goes back one screen. Move menu to main, party list to main (cursor on PARTY), and summary to the party list (cursor on that Pokémon). On the main menu it does nothing.
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

## Adding SWITCH later
The summary screen builds its buttons from `getMenuOptions('summary')`, which is `['BACK']` today. To add switching, put `'SWITCH'` in that list, handle it in `selectOption` in `battle.js` by changing `lead`, and nothing in the components has to change.

## Editing content
- Change move names, damage, or messages in `src/data/moves.js`.
- Change the party (names, levels, HP, experience, type, role, dates, description) in `src/data/party.js`. `type`, `role`, `dates`, and `description` are optional, and the summary leaves out whichever are missing. The RUN page can import this same file later.
- Change the Recruiter's Pokémon and attacks in `src/data/pokemon.js`.
- To add real sprites, put the images in `src/assets/sprites/`, import them in the data file, and set each Pokémon's `sprite`.

## Testing
- `battle.test.js` tests the logic directly: damage, fainting and sending out the next Pokémon, victory, HP limits, no moves after victory, rematch, menus, cursor edges, and the party screens.
- `party.test.js` checks that the party data has six unique Pokémon with the fields the screens need.
- `BattleScreen.test.jsx` plays the real screen with fake timers: the intro, typing and advancing, menus with arrows and Escape, a full battle to victory, Rematch, and the party list and summaries.
- `PartySummary.test.jsx` checks that a Pokémon with missing optional fields still renders.
