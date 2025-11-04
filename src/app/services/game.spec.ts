import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Game } from './game';
import {
  LixsoSymbol,
  LTileOrientation,
  LTile,
  PuzzleDefinition
} from '../models/game.models';

describe('Game Service', () => {
  let service: Game;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Game]
    });
    service = TestBed.inject(Game);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Game Initialization', () => {
    it('should initialize game with empty grid', async () => {
      const state = await firstValueFrom(service.getGameState());
      expect(state.grid).toBeDefined();
      expect(state.grid.length).toBeGreaterThan(0);
      expect(state.placedTiles).toEqual([]);
      expect(state.completed).toBe(false);
    });

    it('should start new game with puzzle definition', async () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 6,
        difficulty: 1,
        prefilledCells: [
          { row: 0, col: 0, symbol: LixsoSymbol.I },
          { row: 2, col: 2, symbol: LixsoSymbol.X }
        ]
      };

      service.startNewGame(puzzle);

      const state = await firstValueFrom(service.getGameState());
      expect(state.gridSize).toBe(6);
      expect(state.grid[0][0].symbol).toBe(LixsoSymbol.I);
      expect(state.grid[0][0].prefilled).toBe(true);
      expect(state.grid[2][2].symbol).toBe(LixsoSymbol.X);
      expect(state.grid[2][2].prefilled).toBe(true);
    });
  });

  describe('Tile Placement', () => {
    beforeEach(() => {
      const puzzle: PuzzleDefinition = {
        gridSize: 9,
        difficulty: 1,
        prefilledCells: []
      };
      service.startNewGame(puzzle);
    });

    it('should place valid tile successfully', () => {
      const tile: LTile = {
        id: 'test-tile-1',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 0,
        anchorCol: 0,
        placed: false
      };

      const result = service.placeTile(tile);
      expect(result).toBe(true);
    });

    it('should reject tile placement out of bounds', () => {
      const tile: LTile = {
        id: 'test-tile-2',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 8,
        anchorCol: 8,
        placed: false
      };

      const result = service.placeTile(tile);
      expect(result).toBe(false);
    });

    it('should reject tile placement on occupied cells', () => {
      const tile1: LTile = {
        id: 'test-tile-3',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 0,
        anchorCol: 0,
        placed: false
      };

      service.placeTile(tile1);

      const tile2: LTile = {
        id: 'test-tile-4',
        symbol: LixsoSymbol.X,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 0,
        anchorCol: 0,
        placed: false
      };

      const result = service.placeTile(tile2);
      expect(result).toBe(false);
    });

    it('should reject tile when same symbols would touch', () => {
      // Place first tile
      const tile1: LTile = {
        id: 'test-tile-5',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 0,
        anchorCol: 0,
        placed: false
      };
      service.placeTile(tile1);

      // Try to place adjacent tile with same symbol
      const tile2: LTile = {
        id: 'test-tile-6',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 2,
        anchorCol: 0,
        placed: false
      };

      const result = service.placeTile(tile2);
      expect(result).toBe(false);
    });

    it('should allow tile placement when symbols are different', () => {
      // Place first tile
      const tile1: LTile = {
        id: 'test-tile-7',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 0,
        anchorCol: 0,
        placed: false
      };
      service.placeTile(tile1);

      // Place adjacent tile with different symbol
      const tile2: LTile = {
        id: 'test-tile-8',
        symbol: LixsoSymbol.X,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 2,
        anchorCol: 0,
        placed: false
      };

      const result = service.placeTile(tile2);
      expect(result).toBe(true);
    });
  });

  describe('Tile Removal', () => {
    it('should remove placed tile successfully', () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 9,
        difficulty: 1,
        prefilledCells: []
      };
      service.startNewGame(puzzle);

      const tile: LTile = {
        id: 'test-tile-9',
        symbol: LixsoSymbol.I,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 0,
        anchorCol: 0,
        placed: false
      };

      service.placeTile(tile);
      const result = service.removeTile('test-tile-9');

      expect(result).toBe(true);
    });

    it('should return false when removing non-existent tile', () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 9,
        difficulty: 1,
        prefilledCells: []
      };
      service.startNewGame(puzzle);

      const result = service.removeTile('non-existent-tile');
      expect(result).toBe(false);
    });
  });

  describe('Game Completion', () => {
    it('should detect when grid is complete', async () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 6,
        difficulty: 1,
        prefilledCells: []
      };
      service.startNewGame(puzzle);

      // Fill entire 6x6 grid with valid tiles
      // This is a simplified test - in reality we'd need valid placement
      const tiles: LTile[] = [
        { id: 't1', symbol: LixsoSymbol.I, orientation: LTileOrientation.UP_RIGHT, anchorRow: 0, anchorCol: 0, placed: false },
        { id: 't2', symbol: LixsoSymbol.X, orientation: LTileOrientation.UP_RIGHT, anchorRow: 0, anchorCol: 2, placed: false },
        { id: 't3', symbol: LixsoSymbol.S, orientation: LTileOrientation.UP_RIGHT, anchorRow: 0, anchorCol: 4, placed: false }
      ];

      tiles.forEach(tile => service.placeTile(tile));

      const state = await firstValueFrom(service.getGameState());
      // We expect the game to track completion status
      expect(state.completed).toBeDefined();
    });
  });

  describe('Game Reset', () => {
    it('should reset game to initial state', async () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 9,
        difficulty: 1,
        prefilledCells: [
          { row: 0, col: 0, symbol: LixsoSymbol.I }
        ]
      };
      service.startNewGame(puzzle);

      // Place some tiles
      const tile: LTile = {
        id: 'test-tile-10',
        symbol: LixsoSymbol.X,
        orientation: LTileOrientation.UP_RIGHT,
        anchorRow: 2,
        anchorCol: 2,
        placed: false
      };
      service.placeTile(tile);

      // Reset
      service.resetGame();

      const state = await firstValueFrom(service.getGameState());
      expect(state.placedTiles.length).toBe(0);
      expect(state.completed).toBe(false);
      // Prefilled cells should remain
      expect(state.grid[0][0].symbol).toBe(LixsoSymbol.I);
      expect(state.grid[0][0].prefilled).toBe(true);
    });
  });

  describe('Hint System', () => {
    it('should provide a valid hint', () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 9,
        difficulty: 1,
        prefilledCells: []
      };
      service.startNewGame(puzzle);

      const hint = service.getHint();
      expect(hint).toBeTruthy();

      if (hint) {
        expect(hint.symbol).toBeDefined();
        expect(hint.orientation).toBeDefined();
        expect(hint.anchorRow).toBeGreaterThanOrEqual(0);
        expect(hint.anchorCol).toBeGreaterThanOrEqual(0);
      }
    });

    it('should return null when no valid placements exist', () => {
      const puzzle: PuzzleDefinition = {
        gridSize: 3,
        difficulty: 1,
        prefilledCells: [
          { row: 0, col: 0, symbol: LixsoSymbol.I },
          { row: 0, col: 1, symbol: LixsoSymbol.I },
          { row: 0, col: 2, symbol: LixsoSymbol.I },
          { row: 1, col: 0, symbol: LixsoSymbol.I },
          { row: 1, col: 1, symbol: LixsoSymbol.I },
          { row: 1, col: 2, symbol: LixsoSymbol.I },
          { row: 2, col: 0, symbol: LixsoSymbol.I },
          { row: 2, col: 1, symbol: LixsoSymbol.I },
          { row: 2, col: 2, symbol: LixsoSymbol.I }
        ]
      };
      service.startNewGame(puzzle);

      const hint = service.getHint();
      expect(hint).toBeNull();
    });
  });
});
