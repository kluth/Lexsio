import { Tile, TileColor } from "./tile";
import { Level } from './levels';

export type CellValue = string | null;

interface PrefilledCell {
  x: number;
  y: number;
  value: CellValue;
}

export class Grid {
  width: number;
  height: number;
  private grid: CellValue[][];

  constructor(width: number, height: number, prefilled: PrefilledCell[] = []) {
    this.width = width;
    this.height = height;
    this.grid = Array(width).fill(null).map(() => Array(height).fill(null));

    for (const cell of prefilled) {
      this.setCell(cell.x, cell.y, cell.value);
    }
  }

  getCell(x: number, y: number): CellValue {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.grid[x][y];
  }

  setCell(x: number, y: number, value: CellValue): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    this.grid[x][y] = value;
  }

  placeTile(tile: Tile, x: number, y: number): boolean {
    // Check for out of bounds and overlap
    for (let i = 0; i < tile.shape.length; i++) {
      for (let j = 0; j < tile.shape[i].length; j++) {
        if (tile.shape[i][j] === 1) {
          const newX = x + j;
          const newY = y + i;
          if (newX >= this.width || newY >= this.height || this.getCell(newX, newY) !== null) {
            return false;
          }
        }
      }
    }

    // Place the tile
    for (let i = 0; i < tile.shape.length; i++) {
      for (let j = 0; j < tile.shape[i].length; j++) {
        if (tile.shape[i][j] === 1) {
          this.setCell(x + j, y + i, tile.color);
        }
      }
    }

    // Check for the 'no touching' rule
    for (let i = 0; i < tile.shape.length; i++) {
      for (let j = 0; j < tile.shape[i].length; j++) {
        if (tile.shape[i][j] === 1) {
          const newX = x + j;
          const newY = y + i;
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue;
              const neighborX = newX + dx;
              const neighborY = newY + dy;

              // Check if the neighbor is part of the same tile
              let isPartOfTile = false;
              for (let ti = 0; ti < tile.shape.length; ti++) {
                for (let tj = 0; tj < tile.shape[ti].length; tj++) {
                  if (tile.shape[ti][tj] === 1 && x + tj === neighborX && y + ti === neighborY) {
                    isPartOfTile = true;
                    break;
                  }
                }
                if (isPartOfTile) break;
              }

              if (!isPartOfTile && this.getCell(neighborX, neighborY) === tile.color) {
                this.removeTile(tile, x, y);
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  }

  removeTile(tile: Tile, x: number, y: number): void {
    for (let i = 0; i < tile.shape.length; i++) {
      for (let j = 0; j < tile.shape[i].length; j++) {
        if (tile.shape[i][j] === 1) {
          this.setCell(x + j, y + i, null);
        }
      }
    }
  }

  isFull(): boolean {
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        if (this.getCell(i, j) === null) {
          return false;
        }
      }
    }
    return true;
  }

  clear(): void {
    this.grid = Array(this.width).fill(null).map(() => Array(this.height).fill(null));
  }

  clone(): Grid {
    const newGrid = new Grid(this.width, this.height);
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        newGrid.setCell(x, y, this.getCell(x, y));
      }
    }
    return newGrid;
  }

  getGridData(): (CellValue)[][] {
    return this.grid;
  }

  getHint(): { tile: Tile, x: number, y: number } | null {
    const allTiles: Tile[] = [];
    for (const color of Object.values(TileColor)) {
      for (let i = 0; i < 4; i++) {
        const tile = new Tile(color);
        for (let j = 0; j < i; j++) {
          tile.rotate();
        }
        allTiles.push(tile);
        const flippedTile = new Tile(color);
        for (let j = 0; j < i; j++) {
          flippedTile.rotate();
        }
        flippedTile.flip();
        allTiles.push(flippedTile);
      }
    }

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.getCell(x, y) === null) {
          for (const tile of allTiles) {
            const tempGrid = this.clone();
            if (tempGrid.placeTile(tile, x, y)) {
              return { tile, x, y };
            }
          }
        }
      }
    }

    return null;
  }

  loadLevel(level: Level): void {
    const puzzleGrid = level.puzzledata;
    this.width = puzzleGrid[0].length;
    this.height = puzzleGrid.length;
    this.grid = Array(this.width).fill(null).map(() => Array(this.height).fill(null));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.setCell(x, y, puzzleGrid[y][x]);
      }
    }
  }
}
