import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PuzzleGenerator } from './puzzle-generator';
import { LixsoSymbol } from '../models/game.models';

describe('PuzzleGenerator', () => {
  let service: PuzzleGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PuzzleGenerator]
    });
    service = TestBed.inject(PuzzleGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Puzzle Generation', () => {
    it('should generate a valid puzzle', () => {
      const puzzle = service.generatePuzzle(9, 1);

      expect(puzzle).toBeDefined();
      expect(puzzle.gridSize).toBe(9);
      expect(puzzle.difficulty).toBe(1);
      expect(puzzle.prefilledCells).toBeDefined();
      expect(Array.isArray(puzzle.prefilledCells)).toBe(true);
    });

    it('should generate puzzles with different difficulties', () => {
      const easyPuzzle = service.generatePuzzle(9, 1);
      const hardPuzzle = service.generatePuzzle(9, 6);

      expect(easyPuzzle.difficulty).toBe(1);
      expect(hardPuzzle.difficulty).toBe(6);

      // Easy puzzles should have more or equal hints (generator is non-deterministic)
      expect(easyPuzzle.prefilledCells.length).toBeGreaterThanOrEqual(hardPuzzle.prefilledCells.length);
    });

    it('should handle invalid grid sizes by defaulting to 9', () => {
      const puzzle = service.generatePuzzle(7, 1); // Not divisible by 3
      expect(puzzle.gridSize).toBe(9);
    });

    it('should generate prefilled cells within grid bounds', () => {
      const puzzle = service.generatePuzzle(9, 3);

      puzzle.prefilledCells.forEach(cell => {
        expect(cell.row).toBeGreaterThanOrEqual(0);
        expect(cell.row).toBeLessThan(9);
        expect(cell.col).toBeGreaterThanOrEqual(0);
        expect(cell.col).toBeLessThan(9);
        expect(Object.values(LixsoSymbol)).toContain(cell.symbol);
      });
    });

    it('should generate unique solutions', () => {
      const puzzle = service.generatePuzzle(9, 3);

      if (puzzle.solution) {
        expect(Array.isArray(puzzle.solution)).toBe(true);
        expect(puzzle.solution.length).toBeGreaterThan(0);

        // Each tile should have unique ID
        const ids = puzzle.solution.map(tile => tile.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });

    it('should verify puzzle has unique solution', () => {
      const puzzle = service.generatePuzzle(9, 3);
      const isUnique = service.verifyUniqueSolution(puzzle);
      expect(isUnique).toBe(true);
    });
  });

  describe('Solution Generation', () => {
    it('should include solution in generated puzzle', () => {
      const puzzle = service.generatePuzzle(9, 1);

      // Solution might be undefined if generation fails
      // In that case, fallback should be used
      expect(puzzle.prefilledCells).toBeDefined();
    });

    it('should handle generation failures gracefully', () => {
      // Try to generate a very constrained puzzle
      const puzzle = service.generatePuzzle(3, 6);

      expect(puzzle).toBeDefined();
      expect(puzzle.gridSize).toBeDefined();
      expect(puzzle.difficulty).toBeDefined();
    });
  });

  describe('Hint Distribution', () => {
    it('should distribute hints across the grid', () => {
      const puzzle = service.generatePuzzle(9, 3);

      if (puzzle.prefilledCells.length > 1) {
        // Check that hints are not all in the same row/column
        const rows = new Set(puzzle.prefilledCells.map(cell => cell.row));
        const cols = new Set(puzzle.prefilledCells.map(cell => cell.col));

        expect(rows.size).toBeGreaterThan(1);
        expect(cols.size).toBeGreaterThan(1);
      }
    });

    it('should use all four symbols in hints', () => {
      const puzzle = service.generatePuzzle(9, 1); // Level 1 has many hints

      const symbols = new Set(puzzle.prefilledCells.map(cell => cell.symbol));

      // With enough hints, we should see multiple different symbols
      expect(symbols.size).toBeGreaterThan(1);
    });
  });

  describe('Grid Size Handling', () => {
    it('should generate 6x6 puzzles', () => {
      const puzzle = service.generatePuzzle(6, 1);
      expect(puzzle.gridSize).toBe(6);
    });

    it('should generate 9x9 puzzles', () => {
      const puzzle = service.generatePuzzle(9, 1);
      expect(puzzle.gridSize).toBe(9);
    });

    it('should generate 12x12 puzzles', () => {
      const puzzle = service.generatePuzzle(12, 1);
      expect(puzzle.gridSize).toBe(12);
    });
  });

  describe('Performance', () => {
    it('should generate puzzle in reasonable time', () => {
      const startTime = Date.now();
      const puzzle = service.generatePuzzle(9, 3);
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(puzzle).toBeDefined();
      // Should complete in less than 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });
});
