# Architecture

## Folder layout
```
src/
  main.jsx          entry point, mounts App
  App.jsx           top-level page
  App.css, index.css
  logic/            plain JS functions, no React
    battle.js
    battle.test.js
  test/setup.js     test setup (jest-dom matchers)
  components/       React components (planned, step 3)
  data/             moves, party, bag content (planned, step 5)
```

## How battle logic connects to React
- `src/logic/` holds pure functions: they take the current battle state and an action, and return a new state. They never import React.
- A component keeps the state (for example with `useState` or `useReducer`) and calls a logic function when the user clicks or presses a key.
- The component then renders whatever the new state says: text box message, which menu is open, who won.
- `src/data/` holds the content (moves, party, bag items) that logic and components read.

```
key / click -> component -> logic function -> new state -> component re-renders
```

## Testing
- Logic is tested directly with Vitest, no browser needed.
- Components get a few interaction tests (keyboard navigation) with Testing Library.
