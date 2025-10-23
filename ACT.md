# Implementation Log (ACT.md)

## Phase 1: Core Game Logic and Basic UI

*   **Task 1: Project Setup**
    *   Initialized npm project (`npm init -y`).
    *   Installed TypeScript, Jest, ts-jest, and @types/jest.
    *   Created `tsconfig.json` with strict settings.
    *   Created `jest.config.js`.
    *   Created `src` and `tests` directories.

*   **Task 2 & 7: Implement the Game Grid (with TDD)**
    *   Created `tests/grid.test.ts` with tests for grid creation, initialization, and cell manipulation.
    *   Implemented the `Grid` class in `src/grid.ts` to pass the tests.

*   **Task 3 & 7: Implement L-Tiles (with TDD)**
    *   Created `tests/tile.test.ts` with tests for tile creation, shape, and rotation.
    *   Implemented the `Tile` class in `src/tile.ts` to pass the tests.

*   **Task 4 & 7: Implement Tile Placement Logic (with TDD)**
    *   Added tests for tile placement to `tests/grid.test.ts`.
    *   Implemented `placeTile` method in `src/grid.ts`.

*   **Task 5 & 7: Implement Game Rules (with TDD)**
    *   Added tests for the "no touching" and "grid completely filled" rules.
    *   Updated `placeTile` and added `isFull` method in `src/grid.ts`.

*   **Task 6: Basic UI for the Game**
    *   Created `index.html`, `style.css`.
    *   Installed `esbuild` but it failed. Switched to `browserify` and `tsify`.
    *   Created `src/main.ts` to render the grid on a canvas.
    *   Added UI for selecting tile colors, rotating, and flipping tiles.

## Phase 2: Game Modes

*   **Task 8 & 9: Implement Classic Puzzle Mode and Level Selection**
    *   Created `src/levels.ts` to store level data.
    *   Modified the `Grid` class to load levels.
    *   Updated the UI to include level selection buttons.

*   **Task 10 & 11: Implement Time Attack Mode**
    *   Added UI elements for Time Attack mode (start button, timer display).
    *   Implemented the timer logic in `src/main.ts`.
    *   Added a win condition check to stop the timer.

## Phase 3: Advanced Features

*   **Task 13 & 14: Implement a Hint System**
    *   Added a `getHint` method to the `Grid` class.
    *   Added a "Hint" button to the UI that shows a valid move.

*   **Task 15 & 16: Implement a Level Editor**
    *   Created `editor.html` and `src/editor.ts` for the level editor.
    *   Implemented a canvas-based editor to create and save level data.
