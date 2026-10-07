# Architecture

## Folder layout
```
src/
  main.jsx            entry point, mounts App
  App.jsx             renders BattleScreen
  index.css           global reset, page background, pixel font
  logic/              plain JS functions, no React
    battle.js         menu options, cursor movement, messages, HP percent
    battle.test.js
  components/         React components
    BattleScreen.jsx  holds state (cursor, message), wires everything together
    BattleScreen.css  all battle styling
    BattleMenu.jsx    the 2x2 menu buttons
    TextBox.jsx       battle message box
    PokemonStatus.jsx name, level, HP bar
    Sprite.jsx        sprite image or placeholder box
    BattleScreen.test.jsx
  data/
    pokemon.js        player and opponent info (name, level, HP, sprite)
  test/setup.js       test setup (jest-dom matchers, cleanup)
```
Still planned: moves, party, and bag data in `src/data/` (step 5).

## How the battle screen connects to the logic
`BattleScreen` is the only component that holds state. The others just display what they are given.

- `BattleScreen` keeps `cursor` (0 to 3) and `message`.
- Arrow key presses on the menu go to `BattleScreen.handleKeyDown`, which calls `moveCursor(cursor, key)` from `logic/battle.js` and stores the result.
- Clicking a button (or pressing Enter or Space on it) calls `handleSelect(index)`, which sets the cursor and stores `getSelectionMessage(option)` as the message.
- `BattleMenu` shows the cursor arrow, and moves browser focus to the button at `cursor`. Only that button is in the Tab order.
- `TextBox` shows `message`. It is an `aria-live` region, so screen readers read each new message.
- `PokemonStatus` calls `getHpPercent` to size the HP bar. `Sprite` shows an image when `sprite` is set in `data/pokemon.js`, otherwise a placeholder box.

```
key / click -> BattleMenu -> BattleScreen handler -> logic function -> new state -> re-render
```

The logic functions never import React, so they are tested without a browser.

## Swapping in real sprites
Put the image in `src/assets/sprites/`, import it in `data/pokemon.js`, and set it as that Pokémon's `sprite`. Nothing else changes.

## Testing
- Logic is tested directly with Vitest: normal moves, edges, unknown keys, messages, HP clamping.
- `BattleScreen.test.jsx` tests the keyboard and click behavior on the real component with Testing Library.
