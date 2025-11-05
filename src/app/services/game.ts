import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  GameState,
  GridCell,
  LixsoSymbol,
  LShapePositions,
  LTile,
  LTileOrientation,
  PuzzleDefinition,
} from '../models/game.models';

@Injectable({
  providedIn: 'root',
})
export class Game {
  private gameState$ = new BehaviorSubject<GameState>(this.initializeGame(9, 1));

  getGameState(): Observable<GameState> {
    return this.gameState$.asObservable();
  }

  private initializeGame(gridSize: number, difficulty: number): GameState {
    const grid: GridCell[][] = [];
    for (let row = 0; row < gridSize; row++) {
      grid[row] = [];
      for (let col = 0; col < gridSize; col++) {
        grid[row][col] = {
          row,
          col,
          symbol: null,
          prefilled: false,
          highlighted: false,
        };
      }
    }

    return {
      grid,
      gridSize,
      placedTiles: [],
      currentTile: null,
      difficulty,
      completed: false,
    };
  }

  startNewGame(puzzle: PuzzleDefinition): void {
    const state = this.initializeGame(puzzle.gridSize, puzzle.difficulty);

    // Set prefilled cells
    puzzle.prefilledCells.forEach((cell) => {
      if (state.grid[cell.row] && state.grid[cell.row][cell.col]) {
        state.grid[cell.row][cell.col].symbol = cell.symbol;
        state.grid[cell.row][cell.col].prefilled = true;
      }
    });

    this.gameState$.next(state);
  }

  // Check if an L-tile can be placed at the given position
  canPlaceTile(tile: LTile): boolean {
    const state = this.gameState$.value;
    const positions = LShapePositions[tile.orientation];

    // Get all cells that would be occupied by this tile
    const occupiedCells: GridCell[] = [];
    for (const offset of positions) {
      const row = tile.anchorRow + offset.row;
      const col = tile.anchorCol + offset.col;

      // Check bounds
      if (row < 0 || row >= state.gridSize || col < 0 || col >= state.gridSize) {
        return false;
      }

      const cell = state.grid[row][col];

      // Check if cell is already occupied
      if (cell.symbol !== null) {
        return false;
      }

      occupiedCells.push(cell);
    }

    // Check if any neighboring cells have the same symbol (including diagonals)
    for (const cell of occupiedCells) {
      if (!this.canPlaceSymbolAtCell(cell.row, cell.col, tile.symbol)) {
        return false;
      }
    }

    return true;
  }

  // Check if a specific symbol can be placed at a cell without touching same symbol
  private canPlaceSymbolAtCell(row: number, col: number, symbol: LixsoSymbol): boolean {
    const state = this.gameState$.value;

    // Check all 8 neighboring cells (including diagonals)
    const neighbors = [
      { r: -1, c: -1 },
      { r: -1, c: 0 },
      { r: -1, c: 1 },
      { r: 0, c: -1 },
      { r: 0, c: 1 },
      { r: 1, c: -1 },
      { r: 1, c: 0 },
      { r: 1, c: 1 },
    ];

    for (const n of neighbors) {
      const nRow = row + n.r;
      const nCol = col + n.c;

      if (nRow >= 0 && nRow < state.gridSize && nCol >= 0 && nCol < state.gridSize) {
        const neighborCell = state.grid[nRow][nCol];
        if (neighborCell.symbol === symbol) {
          return false;
        }
      }
    }

    return true;
  }

  // Place a tile on the grid
  placeTile(tile: LTile): boolean {
    if (!this.canPlaceTile(tile)) {
      return false;
    }

    const state = this.gameState$.value;
    const positions = LShapePositions[tile.orientation];

    // Place the tile
    for (const offset of positions) {
      const row = tile.anchorRow + offset.row;
      const col = tile.anchorCol + offset.col;
      state.grid[row][col].symbol = tile.symbol;
    }

    tile.placed = true;
    state.placedTiles.push(tile);

    // Check if game is completed
    state.completed = this.isGridComplete();

    this.gameState$.next(state);
    return true;
  }

  // Remove a tile from the grid
  removeTile(tileId: string): boolean {
    const state = this.gameState$.value;
    const tileIndex = state.placedTiles.findIndex((t) => t.id === tileId);

    if (tileIndex === -1) {
      return false;
    }

    const tile = state.placedTiles[tileIndex];
    const positions = LShapePositions[tile.orientation];

    // Remove the tile from grid
    for (const offset of positions) {
      const row = tile.anchorRow + offset.row;
      const col = tile.anchorCol + offset.col;
      if (!state.grid[row][col].prefilled) {
        state.grid[row][col].symbol = null;
      }
    }

    state.placedTiles.splice(tileIndex, 1);
    state.completed = false;

    this.gameState$.next(state);
    return true;
  }

  // Check if the entire grid is filled
  private isGridComplete(): boolean {
    const state = this.gameState$.value;

    for (let row = 0; row < state.gridSize; row++) {
      for (let col = 0; col < state.gridSize; col++) {
        if (state.grid[row][col].symbol === null) {
          return false;
        }
      }
    }

    return true;
  }

  // Highlight cells that would be occupied by a tile (for preview)
  previewTilePlacement(tile: LTile | null): void {
    const state = this.gameState$.value;

    // Clear all highlights
    for (let row = 0; row < state.gridSize; row++) {
      for (let col = 0; col < state.gridSize; col++) {
        state.grid[row][col].highlighted = false;
      }
    }

    // Highlight new positions if tile is provided
    if (tile) {
      const positions = LShapePositions[tile.orientation];
      for (const offset of positions) {
        const row = tile.anchorRow + offset.row;
        const col = tile.anchorCol + offset.col;

        if (row >= 0 && row < state.gridSize && col >= 0 && col < state.gridSize) {
          state.grid[row][col].highlighted = true;
        }
      }
    }

    this.gameState$.next(state);
  }

  // Reset the current game
  resetGame(): void {
    const state = this.gameState$.value;

    // Clear all placed tiles
    state.placedTiles.forEach((tile) => {
      const positions = LShapePositions[tile.orientation];
      for (const offset of positions) {
        const row = tile.anchorRow + offset.row;
        const col = tile.anchorCol + offset.col;
        if (!state.grid[row][col].prefilled) {
          state.grid[row][col].symbol = null;
        }
      }
    });

    state.placedTiles = [];
    state.currentTile = null;
    state.completed = false;

    this.gameState$.next(state);
  }

  // Get hint: find a valid placement for any symbol
  getHint(): LTile | null {
    const state = this.gameState$.value;
    const symbols = [LixsoSymbol.I, LixsoSymbol.X, LixsoSymbol.S, LixsoSymbol.O];
    const orientations = Object.values(LTileOrientation);

    // Try to find a valid placement
    for (const symbol of symbols) {
      for (let row = 0; row < state.gridSize; row++) {
        for (let col = 0; col < state.gridSize; col++) {
          for (const orientation of orientations) {
            const testTile: LTile = {
              id: `hint-${Date.now()}`,
              symbol,
              orientation,
              anchorRow: row,
              anchorCol: col,
              placed: false,
            };

            // eslint-disable-next-line max-depth
            if (this.canPlaceTile(testTile)) {
              return testTile;
            }
          }
        }
      }
    }

    return null;
  }
}
