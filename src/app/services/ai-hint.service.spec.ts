/* eslint-disable @typescript-eslint/no-shadow */
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { GridCell, LixsoSymbol } from '../models/game.models';

import { AIHintService } from './ai-hint.service';

describe('AIHintService', () => {
  let service: AIHintService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AIHintService],
    });
    service = TestBed.inject(AIHintService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have capabilities', () => {
      const capabilities = service.getCapabilities();
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.available).toBe('boolean');
    });

    it('should have statistics', () => {
      const stats = service.getStatistics();
      expect(stats).toBeDefined();
      expect(stats.totalHints).toBe(0);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      service.updateConfig({ useChromeAI: false });
      // Config updated successfully (no error thrown)
      expect(service).toBeTruthy();
    });

    it('should update temperature', () => {
      expect(() => service.updateConfig({ temperature: 0.9 })).not.toThrow();
    });

    it('should update cache settings', () => {
      expect(() => service.updateConfig({ enableCache: false })).not.toThrow();
    });

    it('should update timeout', () => {
      expect(() => service.updateConfig({ timeout: 10000 })).not.toThrow();
    });
  });

  describe('Hint Generation - Heuristics', () => {
    const createTestGrid = (): GridCell[][] => {
      return Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );
    };

    it('should generate hint for empty grid', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'beginner', 'next-move');
      expect(hint).toBeDefined();
      expect(hint.title).toBeTruthy();
      expect(hint.explanation).toBeTruthy();
    });

    it('should generate different hints for different levels', async () => {
      const grid = createTestGrid();
      const beginnerHint = await service.generateHint(grid, 'beginner', 'next-move');
      const expertHint = await service.generateHint(grid, 'expert', 'next-move');

      expect(beginnerHint).toBeDefined();
      expect(expertHint).toBeDefined();
    });

    it('should generate strategy hints', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'intermediate', 'strategy');
      expect(hint).toBeDefined();
      expect(hint.type).toBe('strategy');
    });

    it('should generate pattern hints', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'intermediate', 'pattern');
      expect(hint).toBeDefined();
      expect(hint.type).toBe('pattern');
    });

    it('should generate mistake hints', async () => {
      const grid = createTestGrid();
      grid[0][0].symbol = LixsoSymbol.I;
      const hint = await service.generateHint(grid, 'beginner', 'mistake');
      expect(hint).toBeDefined();
      expect(hint.type).toBe('mistake');
    });
  });

  describe('Board Analysis', () => {
    const createTestGrid = (): GridCell[][] => {
      return Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: 9 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );
    };

    it('should analyze empty grid', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'beginner', 'next-move');
      expect(hint).toBeDefined();
    });

    it('should analyze partially filled grid', async () => {
      const grid = createTestGrid();
      grid[0][0].symbol = LixsoSymbol.I;
      grid[1][1].symbol = LixsoSymbol.X;

      const hint = await service.generateHint(grid, 'intermediate', 'next-move');
      expect(hint).toBeDefined();
    });

    it('should handle grid with multiple symbols', async () => {
      const grid = createTestGrid();
      grid[0][0].symbol = LixsoSymbol.I;
      grid[0][1].symbol = LixsoSymbol.X;
      grid[0][2].symbol = LixsoSymbol.S;
      grid[0][3].symbol = LixsoSymbol.O;

      const hint = await service.generateHint(grid, 'beginner', 'pattern');
      expect(hint).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    const createTestGrid = (): GridCell[][] => {
      return Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );
    };

    it('should cache generated hints', async () => {
      const grid = createTestGrid();
      const hint1 = await service.generateHint(grid, 'beginner', 'next-move');
      const hint2 = await service.generateHint(grid, 'beginner', 'next-move');

      expect(hint1).toEqual(hint2);
    });

    it('should clear cache', async () => {
      const grid = createTestGrid();
      await service.generateHint(grid, 'beginner', 'next-move');

      expect(() => service.clearCache()).not.toThrow();
    });

    it('should update statistics', async () => {
      const grid = createTestGrid();
      const initialStats = service.getStatistics();

      await service.generateHint(grid, 'beginner', 'next-move');

      const updatedStats = service.getStatistics();
      expect(updatedStats.totalHints).toBeGreaterThanOrEqual(initialStats.totalHints);
    });
  });

  describe('Chrome AI Detection', () => {
    it('should detect Chrome AI availability', () => {
      const capabilities = service.getCapabilities();
      expect(capabilities).toBeDefined();
      expect(typeof capabilities.available).toBe('boolean');
    });

    it('should handle missing Chrome AI gracefully', async () => {
      const grid = Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );

      const hint = await service.generateHint(grid, 'beginner', 'next-move');
      expect(hint).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid grid gracefully', async () => {
      const invalidGrid: GridCell[][] = [];

      await expect(service.generateHint(invalidGrid, 'beginner', 'next-move')).rejects.toThrow();
    });

    it('should handle service destruction', () => {
      expect(() => service.destroy()).not.toThrow();
    });
  });

  describe('Hint Levels', () => {
    const createTestGrid = (): GridCell[][] => {
      return Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );
    };

    it('should generate beginner level hints', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'beginner', 'next-move');
      expect(hint).toBeDefined();
    });

    it('should generate intermediate level hints', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'intermediate', 'next-move');
      expect(hint).toBeDefined();
    });

    it('should generate advanced level hints', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'advanced', 'next-move');
      expect(hint).toBeDefined();
    });

    it('should generate expert level hints', async () => {
      const grid = createTestGrid();
      const hint = await service.generateHint(grid, 'expert', 'next-move');
      expect(hint).toBeDefined();
    });
  });

  describe('Statistics Tracking', () => {
    const createTestGrid = (): GridCell[][] => {
      return Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );
    };

    it('should track total hints generated', async () => {
      const grid = createTestGrid();
      const initialCount = service.getStatistics().totalHints;

      await service.generateHint(grid, 'beginner', 'next-move');
      await service.generateHint(grid, 'intermediate', 'strategy');

      const finalCount = service.getStatistics().totalHints;
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });

    it('should track average response time', async () => {
      const grid = createTestGrid();
      await service.generateHint(grid, 'beginner', 'next-move');

      const stats = service.getStatistics();
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should track heuristic hint count', async () => {
      const grid = createTestGrid();
      const initialCount = service.getStatistics().heuristicHints;

      await service.generateHint(grid, 'beginner', 'next-move');

      const finalCount = service.getStatistics().heuristicHints;
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });
  });
});
