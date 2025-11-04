import { PuzzleDefinition, LixsoSymbol } from '../models/game.models';

// Collection of Lixso puzzles with varying difficulty levels
export const PUZZLES: PuzzleDefinition[] = [
  // Level 1 - Beginner: 9x9 grid with many prefilled cells
  {
    gridSize: 9,
    difficulty: 1,
    prefilledCells: [
      { row: 0, col: 2, symbol: LixsoSymbol.I },
      { row: 1, col: 4, symbol: LixsoSymbol.X },
      { row: 2, col: 1, symbol: LixsoSymbol.S },
      { row: 2, col: 6, symbol: LixsoSymbol.O },
      { row: 3, col: 3, symbol: LixsoSymbol.I },
      { row: 4, col: 0, symbol: LixsoSymbol.X },
      { row: 4, col: 7, symbol: LixsoSymbol.S },
      { row: 5, col: 5, symbol: LixsoSymbol.O },
      { row: 6, col: 2, symbol: LixsoSymbol.I },
      { row: 7, col: 4, symbol: LixsoSymbol.X },
      { row: 8, col: 6, symbol: LixsoSymbol.S }
    ]
  },

  // Level 2 - Easy: 9x9 grid with moderate hints
  {
    gridSize: 9,
    difficulty: 2,
    prefilledCells: [
      { row: 0, col: 4, symbol: LixsoSymbol.X },
      { row: 1, col: 1, symbol: LixsoSymbol.I },
      { row: 2, col: 7, symbol: LixsoSymbol.S },
      { row: 3, col: 3, symbol: LixsoSymbol.O },
      { row: 4, col: 5, symbol: LixsoSymbol.I },
      { row: 5, col: 2, symbol: LixsoSymbol.X },
      { row: 6, col: 6, symbol: LixsoSymbol.S },
      { row: 7, col: 0, symbol: LixsoSymbol.O },
      { row: 8, col: 4, symbol: LixsoSymbol.I }
    ]
  },

  // Level 3 - Medium: 9x9 grid with fewer hints
  {
    gridSize: 9,
    difficulty: 3,
    prefilledCells: [
      { row: 1, col: 3, symbol: LixsoSymbol.I },
      { row: 2, col: 6, symbol: LixsoSymbol.X },
      { row: 3, col: 1, symbol: LixsoSymbol.S },
      { row: 4, col: 4, symbol: LixsoSymbol.O },
      { row: 5, col: 7, symbol: LixsoSymbol.I },
      { row: 6, col: 2, symbol: LixsoSymbol.X },
      { row: 7, col: 5, symbol: LixsoSymbol.S }
    ]
  },

  // Level 4 - Challenging: 9x9 grid with minimal hints
  {
    gridSize: 9,
    difficulty: 4,
    prefilledCells: [
      { row: 0, col: 3, symbol: LixsoSymbol.O },
      { row: 2, col: 5, symbol: LixsoSymbol.I },
      { row: 4, col: 1, symbol: LixsoSymbol.X },
      { row: 4, col: 7, symbol: LixsoSymbol.S },
      { row: 6, col: 3, symbol: LixsoSymbol.O },
      { row: 8, col: 5, symbol: LixsoSymbol.I }
    ]
  },

  // Level 5 - Hard: 9x9 grid with very few hints
  {
    gridSize: 9,
    difficulty: 5,
    prefilledCells: [
      { row: 1, col: 4, symbol: LixsoSymbol.X },
      { row: 3, col: 2, symbol: LixsoSymbol.S },
      { row: 5, col: 6, symbol: LixsoSymbol.O },
      { row: 7, col: 3, symbol: LixsoSymbol.I }
    ]
  },

  // Level 6 - Expert: 9x9 grid with minimal hints
  {
    gridSize: 9,
    difficulty: 6,
    prefilledCells: [
      { row: 2, col: 4, symbol: LixsoSymbol.I },
      { row: 4, col: 2, symbol: LixsoSymbol.X },
      { row: 6, col: 6, symbol: LixsoSymbol.S }
    ]
  },

  // Small grid - 6x6 for quick play
  {
    gridSize: 6,
    difficulty: 1,
    prefilledCells: [
      { row: 0, col: 2, symbol: LixsoSymbol.I },
      { row: 1, col: 4, symbol: LixsoSymbol.X },
      { row: 2, col: 1, symbol: LixsoSymbol.S },
      { row: 3, col: 3, symbol: LixsoSymbol.O },
      { row: 4, col: 0, symbol: LixsoSymbol.I },
      { row: 5, col: 4, symbol: LixsoSymbol.X }
    ]
  }
];

// Get a random puzzle by difficulty
export function getPuzzleByDifficulty(difficulty: number): PuzzleDefinition {
  const puzzlesOfDifficulty = PUZZLES.filter(p => p.difficulty === difficulty);
  if (puzzlesOfDifficulty.length === 0) {
    return PUZZLES[0]; // Default to easiest puzzle
  }
  const randomIndex = Math.floor(Math.random() * puzzlesOfDifficulty.length);
  return puzzlesOfDifficulty[randomIndex];
}

// Get puzzle by index
export function getPuzzle(index: number): PuzzleDefinition {
  if (index < 0 || index >= PUZZLES.length) {
    return PUZZLES[0];
  }
  return PUZZLES[index];
}
