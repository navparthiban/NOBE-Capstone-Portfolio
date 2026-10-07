# Architecture

## Folder layout
```
src/
  main.jsx            entry point, mounts App
  App.jsx             renders BattleScreen
  index.css           global reset, page background, pixel font
  logic/              plain JS functions, no React
    battle.js         battle state and rules (see below)
    battle.test.js
  hooks/
    useTypewriter.js  reveals message text one character at a time
  components/         React components
    BattleScreen.jsx  runs the battle reducer and wires everything together
    BattleScreen.css  all battle styling
    BattleMenu.jsx    the menu buttons (main, move, or rematch)
    TextBox.jsx       typewriter message box, advances the message queue
    PokemonStatus.jsx name, level, HP bar
    Sprite.jsx        sprite image or placeholder box
    BattleScreen.test.jsx
  data/
    moves.js          Navin's four moves: name, damage, message
    pokemon.js        Navin's Pokémon and the Recruiter's team of three
  test/setup.js       test setup (jest-dom matchers, cleanup)
```
Still planned: party, bag, and resume content in `src/data/` (step 5).

## How battle state works
All rules live in `src/logic/battle.js` as plain functions. The whole battle is one object:

```js
{
  menu: 'main' | 'fight' | 'victory',  // which options the menu shows
  cursor: 0,                           // highlighted option
  queue: [{ text, changes }, ...],     // messages waiting to be read; queue[0] is on screen
  player: { name, level, hp, maxHp, sprite },
  team: [ ...three Recruiter Pokémon, each with its own hp and attack ],
  active: 0,                           // which Recruiter Pokémon is on the field
}
```

- `createBattle()` builds the starting state: everyone at full HP, intro messages queued.
- `battleReducer(state, action)` is the one entry point for changes. It never changes the old state; it returns a new one. Actions:
  - `cursor` (arrow key): moves the cursor with `moveCursor`, which stops at the edges.
  - `select` (Enter or click): FIGHT opens the move menu, a move calls `takeTurn`, BACK goes back, REMATCH calls `createBattle()`. BAG, PARTY, and RUN queue a placeholder message.
  - `back` (Escape): leaves the move menu.
  - `advance`: removes the message on screen from the queue, then applies the changes of the next message.
- While `queue` has messages, the reducer ignores everything except `advance`, so the visitor reads each message before acting.
- `takeTurn(state, moveIndex)` plays one turn: the move hits (opponent HP stops at 0), then either the opponent faints (next one is sent out, or victory if it was the last) or it attacks back (player HP stops at 1). It queues a message for each step. After victory it does nothing.
- Each queued message carries the `changes` that go with it: the move message lowers the opponent's HP, the counterattack message lowers the player's HP, and "Recruiter sent out HIREMON!" switches `active`. A change is applied when its message comes on screen, so the HP bars and the Pokémon on the field always match what the text box says. By the time the queue is empty, the state is the same as if everything had happened at once.

## How the components use it
```
key / click -> BattleScreen -> dispatch(action) -> battleReducer -> new state -> re-render
```
- `BattleScreen` calls `useReducer(battleReducer, null, createBattle)` and passes pieces of the state down. It turns key presses into actions: arrows to `cursor`, Escape to `back`.
- While messages are queued, `TextBox` shows `queue[0]` as a button and the menu is hidden. A click or Enter finishes the typing, and the next one dispatches `advance`. When the queue is empty, `TextBox` shows a prompt from `getPrompt(state)` and `BattleMenu` appears.
- `BattleMenu` lists `getMenuOptions(state.menu)`, shows the ▶ cursor, and moves browser focus to the button at `cursor`. Only that button is in the Tab order.
- `useTypewriter` only controls how fast the text appears. It skips the animation if the visitor prefers reduced motion. Screen readers read the full message once from a hidden live region instead of letter by letter.
- `PokemonStatus` calls `getHpPercent` to size the HP bar. The opponent shown is `team[active]`.

## Editing content
- Change move names, damage, or messages in `src/data/moves.js`.
- Change Pokémon names, levels, HP, or the Recruiter's attacks in `src/data/pokemon.js`.
- To add real sprites, put the images in `src/assets/sprites/`, import them in `pokemon.js`, and set each Pokémon's `sprite`.

## Testing
- `battle.test.js` tests the logic directly: damage, fainting and sending out the next Pokémon, victory, HP limits, no moves after victory, rematch, menus, and cursor edges.
- `BattleScreen.test.jsx` plays the real screen with fake timers: the intro, typing and advancing, menus with arrows and Escape, a full battle to victory, and Rematch.
