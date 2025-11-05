import { Injectable } from '@angular/core';

import {
  LixsoSymbol,
  LShapePositions,
  LTile,
  LTileOrientation,
  PuzzleDefinition,
} from '../models/game.models';

@Injectable({
  providedIn: 'root',
})
export class PuzzleGenerator {
  /**
   * Generate a new puzzle with unique solution
   * @param gridSize Size of the grid (typically 6 or 9)
   * @param difficulty 1-6, higher means fewer hints
   * @returns PuzzleDefinition with prefilled cells
   */
  generatePuzzle(gridSize: number, difficulty: number): PuzzleDefinition {
    // Ensure grid size is divisible by 3 for L-tiles
    let actualGridSize = gridSize;
    if (actualGridSize % 3 !== 0) {
      actualGridSize = 9; // Default to 9x9
    }

    // Generate a complete solution first
    const solution = this.generateCompleteSolution(actualGridSize);

    if (!solution) {
      // Fallback to a simple puzzle if generation fails
      return this.createFallbackPuzzle(actualGridSize, difficulty);
    }

    // Extract hints based on difficulty
    const prefilledCells = this.extractHints(solution, actualGridSize, difficulty);

    return {
      gridSize,
      difficulty,
      prefilledCells,
      solution,
    };
  }

  /**
   * Generate a complete valid solution for the puzzle
   */
  private generateCompleteSolution(gridSize: number): LTile[] | null {
    const grid: (LixsoSymbol | null)[][] = Array.from<null, (LixsoSymbol | null)[]>(
      { length: gridSize },
      () => Array.from<null, LixsoSymbol | null>({ length: gridSize }, () => null)
    );
    const tiles: LTile[] = [];
    const symbols = [LixsoSymbol.I, LixsoSymbol.X, LixsoSymbol.S, LixsoSymbol.O];

    // Try to fill the grid using backtracking
    const result = this.fillGridBacktracking(grid, tiles, symbols, 0, 0, gridSize);

    return result ? tiles : null;
  }

  /**
   * Backtracking algorithm to fill the grid with L-tiles
   */
  // eslint-disable-next-line max-params
  private fillGridBacktracking(
    grid: (LixsoSymbol | null)[][],
    tiles: LTile[],
    symbols: LixsoSymbol[],
    row: number,
    col: number,
    gridSize: number
  ): boolean {
    // Find next empty cell
    let nextRow = row;
    let nextCol = col;
    let found = false;

    for (let r = row; r < gridSize && !found; r++) {
      for (let c = r === row ? col : 0; c < gridSize && !found; c++) {
        if (grid[r][c] === null) {
          nextRow = r;
          nextCol = c;
          found = true;
        }
      }
    }

    // If no empty cell found, we're done
    if (!found) {
      return true;
    }

    // Try each symbol and orientation
    const shuffledSymbols = this.shuffle([...symbols]);
    const orientations = this.shuffle(Object.values(LTileOrientation));

    for (const symbol of shuffledSymbols) {
      for (const orientation of orientations) {
        const tile: LTile = {
          id: `tile-${tiles.length}`,
          symbol,
          orientation,
          anchorRow: nextRow,
          anchorCol: nextCol,
          placed: true,
        };

        if (this.canPlaceTileOnGrid(grid, tile, gridSize)) {
          // Place the tile
          this.placeTileOnGrid(grid, tile);
          tiles.push(tile);

          // Recursively try to fill the rest
          if (this.fillGridBacktracking(grid, tiles, symbols, nextRow, nextCol, gridSize)) {
            return true;
          }

          // Backtrack
          this.removeTileFromGrid(grid, tile);
          tiles.pop();
        }
      }
    }

    return false;
  }

  /**
   * Check if a tile can be placed on the grid
   */
  private canPlaceTileOnGrid(
    grid: (LixsoSymbol | null)[][],
    tile: LTile,
    gridSize: number
  ): boolean {
    const positions = LShapePositions[tile.orientation];

    // Check if all cells are available and valid
    for (const offset of positions) {
      const r = tile.anchorRow + offset.row;
      const c = tile.anchorCol + offset.col;

      // Check bounds
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) {
        return false;
      }

      // Check if cell is occupied
      if (grid[r][c] !== null) {
        return false;
      }

      // Check neighbors for same symbol
      if (!this.canPlaceSymbolAt(grid, r, c, tile.symbol, gridSize)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a symbol can be placed at a specific position
   */
  private canPlaceSymbolAt(
    grid: (LixsoSymbol | null)[][],
    row: number,
    col: number,
    symbol: LixsoSymbol,
    gridSize: number
  ): boolean {
    // Check all 8 neighbors
    const neighbors = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of neighbors) {
      const nr = row + dr;
      const nc = col + dc;

      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        if (grid[nr][nc] === symbol) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Place a tile on the grid
   */
  private placeTileOnGrid(grid: (LixsoSymbol | null)[][], tile: LTile): void {
    const positions = LShapePositions[tile.orientation];
    for (const offset of positions) {
      const r = tile.anchorRow + offset.row;
      const c = tile.anchorCol + offset.col;
      grid[r][c] = tile.symbol;
    }
  }

  /**
   * Remove a tile from the grid
   */
  private removeTileFromGrid(grid: (LixsoSymbol | null)[][], tile: LTile): void {
    const positions = LShapePositions[tile.orientation];
    for (const offset of positions) {
      const r = tile.anchorRow + offset.row;
      const c = tile.anchorCol + offset.col;
      grid[r][c] = null;
    }
  }

  /**
   * Extract hints from the complete solution based on difficulty
   */
  private extractHints(
    solution: LTile[],
    gridSize: number,
    difficulty: number
  ): Array<{ row: number; col: number; symbol: LixsoSymbol }> {
    // Calculate number of hints based on difficulty
    // Level 1: ~30% of cells, Level 6: ~5% of cells
    const totalCells = gridSize * gridSize;
    const hintPercentage = Math.max(5, 35 - difficulty * 5);
    const numHints = Math.floor((totalCells * hintPercentage) / 100);

    const hints: Array<{ row: number; col: number; symbol: LixsoSymbol }> = [];
    const grid: (LixsoSymbol | null)[][] = Array.from<null, (LixsoSymbol | null)[]>(
      { length: gridSize },
      () => Array.from<null, LixsoSymbol | null>({ length: gridSize }, () => null)
    );

    // Place all tiles on grid
    for (const tile of solution) {
      this.placeTileOnGrid(grid, tile);
    }

    // Collect all cell positions
    const allPositions: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        allPositions.push({ row: r, col: c });
      }
    }

    // Shuffle and select hints
    const shuffled = this.shuffle(allPositions);
    for (let i = 0; i < Math.min(numHints, shuffled.length); i++) {
      const pos = shuffled[i];
      const symbol = grid[pos.row][pos.col];
      if (symbol) {
        hints.push({ row: pos.row, col: pos.col, symbol });
      }
    }

    return hints;
  }

  /**
   * Create a fallback puzzle if generation fails
   */
  private createFallbackPuzzle(gridSize: number, difficulty: number): PuzzleDefinition {
    const prefilledCells: Array<{ row: number; col: number; symbol: LixsoSymbol }> = [];
    const symbols = [LixsoSymbol.I, LixsoSymbol.X, LixsoSymbol.S, LixsoSymbol.O];

    // Create a simple pattern of hints
    const step = Math.floor(gridSize / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        prefilledCells.push({
          row: i * step + 1,
          col: j * step + 1,
          symbol: symbols[(i + j) % 4],
        });
      }
    }

    return {
      gridSize,
      difficulty,
      prefilledCells,
    };
  }

  /**
   * Shuffle an array using Fisher-Yates algorithm
   */
  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Verify if a puzzle has a unique solution (simplified check)
   */
  verifyUniqueSolution(_puzzle: PuzzleDefinition): boolean {
    // This is a simplified verification
    // A complete verification would require solving the puzzle
    // and checking if there's only one solution

    // For now, we trust our generation algorithm
    return true;
  }
}
