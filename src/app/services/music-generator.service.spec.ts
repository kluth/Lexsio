/* eslint-disable @typescript-eslint/no-shadow */
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GridCell, LTile, LTileOrientation, LixsoSymbol } from '../models/game.models';

import { MusicGeneratorService } from './music-generator.service';

// Mock Tone.js
vi.mock('tone', () => {
  const mockSynth = {
    toDestination: vi.fn().mockReturnThis(),
    volume: { value: 0 },
    dispose: vi.fn(),
    triggerAttackRelease: vi.fn(),
    set: vi.fn(),
  };

  const mockTransport = {
    bpm: { value: 120 },
  };

  const mockContext = {
    state: 'running',
    dispose: vi.fn(),
  };

  return {
    PolySynth: vi.fn(() => mockSynth),
    Synth: vi.fn(),
    Time: vi.fn((_duration: string) => ({
      toSeconds: () => 0.25,
    })),
    Frequency: vi.fn((note: string) => ({
      transpose: vi.fn(() => ({
        toNote: () => note,
      })),
    })),
    now: () => 0,
    start: () => Promise.resolve(),
    context: mockContext,
    getContext: () => mockContext,
    getTransport: () => mockTransport,
  };
});

describe('MusicGeneratorService', () => {
  let service: MusicGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MusicGeneratorService],
    });
    service = TestBed.inject(MusicGeneratorService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have default configuration', () => {
      const config = service.getConfig();
      expect(config.enabled).toBe(true);
      expect(config.volume).toBe(0.5);
      expect(config.scale).toBe('pentatonic');
      expect(config.genre).toBe('ambient');
    });
  });

  describe('Configuration Management', () => {
    it('should update volume', () => {
      service.setVolume(0.8);
      expect(service.getConfig().volume).toBe(0.8);
    });

    it('should clamp volume between 0 and 1', () => {
      service.setVolume(1.5);
      expect(service.getConfig().volume).toBe(1);

      service.setVolume(-0.5);
      expect(service.getConfig().volume).toBe(0);
    });

    it('should update scale', () => {
      service.setScale('major');
      expect(service.getConfig().scale).toBe('major');
    });

    it('should update genre', () => {
      service.setGenre('jazz');
      expect(service.getConfig().genre).toBe('jazz');
    });

    it('should update tempo', () => {
      service.setTempo(140);
      expect(service.getConfig().tempo).toBe(140);
    });

    it('should clamp tempo between 60 and 240', () => {
      service.setTempo(300);
      expect(service.getConfig().tempo).toBe(240);

      service.setTempo(30);
      expect(service.getConfig().tempo).toBe(60);
    });

    it('should toggle enabled', () => {
      const initial = service.getConfig().enabled;
      service.toggleEnabled();
      expect(service.getConfig().enabled).toBe(!initial);
    });

    it('should update multiple settings at once', () => {
      service.updateConfig({
        volume: 0.7,
        scale: 'minor',
        tempo: 100,
      });

      const config = service.getConfig();
      expect(config.volume).toBe(0.7);
      expect(config.scale).toBe('minor');
      expect(config.tempo).toBe(100);
    });
  });

  describe('Tile Placement Music', () => {
    const createTestTile = (symbol: LixsoSymbol): LTile => ({
      symbol,
      orientation: LTileOrientation.UP_RIGHT,
      anchorRow: 0,
      anchorCol: 0,
      placed: false,
    });

    it('should handle tile placement', async () => {
      const tile = createTestTile(LixsoSymbol.I);
      await expect(service.playTilePlacement(tile)).resolves.toBeUndefined();
    });

    it('should handle different symbols', async () => {
      const symbols = [LixsoSymbol.I, LixsoSymbol.X, LixsoSymbol.S, LixsoSymbol.O];

      for (const symbol of symbols) {
        const tile = createTestTile(symbol);
        await expect(service.playTilePlacement(tile)).resolves.toBeUndefined();
      }
    });

    it('should not play when disabled', async () => {
      service.updateConfig({ enabled: false });
      const tile = createTestTile(LixsoSymbol.I);
      await expect(service.playTilePlacement(tile)).resolves.toBeUndefined();
    });

    it('should not play when playOnTilePlacement is false', async () => {
      service.updateConfig({ playOnTilePlacement: false });
      const tile = createTestTile(LixsoSymbol.I);
      await expect(service.playTilePlacement(tile)).resolves.toBeUndefined();
    });
  });

  describe('Completion Melody', () => {
    const createTestGrid = (): GridCell[][] => {
      return Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 3 }, (_, col) => ({
          row,
          col,
          symbol: null,
        }))
      );
    };

    it('should play completion melody', async () => {
      const grid = createTestGrid();
      grid[0][0].symbol = LixsoSymbol.I;
      grid[0][1].symbol = LixsoSymbol.X;
      grid[0][2].symbol = LixsoSymbol.S;

      await expect(service.playCompletionMelody(grid)).resolves.toBeUndefined();
    });

    it('should handle empty grid', async () => {
      const grid = createTestGrid();
      await expect(service.playCompletionMelody(grid)).resolves.toBeUndefined();
    });

    it('should handle different grid sizes', async () => {
      const sizes = [3, 5, 9];
      for (const size of sizes) {
        const grid = Array.from({ length: size }, (_, row) =>
          Array.from({ length: size }, (_, col) => ({
            row,
            col,
            symbol: null,
          }))
        );
        await expect(service.playCompletionMelody(grid)).resolves.toBeUndefined();
      }
    });

    it('should not play when disabled', async () => {
      service.updateConfig({ enabled: false });
      const grid = createTestGrid();
      await expect(service.playCompletionMelody(grid)).resolves.toBeUndefined();
    });

    it('should not play when playOnCompletion is false', async () => {
      service.updateConfig({ playOnCompletion: false });
      const grid = createTestGrid();
      await expect(service.playCompletionMelody(grid)).resolves.toBeUndefined();
    });
  });

  describe('Musical Scales', () => {
    it('should support major scale', () => {
      service.setScale('major');
      expect(service.getConfig().scale).toBe('major');
    });

    it('should support minor scale', () => {
      service.setScale('minor');
      expect(service.getConfig().scale).toBe('minor');
    });

    it('should support pentatonic scale', () => {
      service.setScale('pentatonic');
      expect(service.getConfig().scale).toBe('pentatonic');
    });

    it('should support chromatic scale', () => {
      service.setScale('chromatic');
      expect(service.getConfig().scale).toBe('chromatic');
    });

    it('should support dorian scale', () => {
      service.setScale('dorian');
      expect(service.getConfig().scale).toBe('dorian');
    });

    it('should support phrygian scale', () => {
      service.setScale('phrygian');
      expect(service.getConfig().scale).toBe('phrygian');
    });

    it('should support lydian scale', () => {
      service.setScale('lydian');
      expect(service.getConfig().scale).toBe('lydian');
    });

    it('should support mixolydian scale', () => {
      service.setScale('mixolydian');
      expect(service.getConfig().scale).toBe('mixolydian');
    });
  });

  describe('Music Genres', () => {
    it('should support classical genre', () => {
      service.setGenre('classical');
      expect(service.getConfig().genre).toBe('classical');
    });

    it('should support jazz genre', () => {
      service.setGenre('jazz');
      expect(service.getConfig().genre).toBe('jazz');
    });

    it('should support ambient genre', () => {
      service.setGenre('ambient');
      expect(service.getConfig().genre).toBe('ambient');
    });

    it('should support electronic genre', () => {
      service.setGenre('electronic');
      expect(service.getConfig().genre).toBe('electronic');
    });

    it('should support lo-fi genre', () => {
      service.setGenre('lo-fi');
      expect(service.getConfig().genre).toBe('lo-fi');
    });
  });

  describe('MIDI Export', () => {
    it('should have MIDI export method', () => {
      const grid: GridCell[][] = [];
      expect(() => service.exportAsMIDI(grid)).not.toThrow();
    });
  });

  describe('Preview Playback', () => {
    it('should play preview', async () => {
      await expect(service.playPreview()).resolves.toBeUndefined();
    });

    it('should play preview with different scales', async () => {
      const scales = ['major', 'minor', 'pentatonic', 'chromatic'] as const;

      for (const scale of scales) {
        service.setScale(scale);
        await expect(service.playPreview()).resolves.toBeUndefined();
      }
    });
  });

  describe('Service Cleanup', () => {
    it('should destroy service cleanly', () => {
      expect(() => service.destroy()).not.toThrow();
    });

    it('should handle multiple destroy calls', () => {
      service.destroy();
      expect(() => service.destroy()).not.toThrow();
    });
  });

  describe('Volume Conversion', () => {
    it('should handle volume changes', () => {
      service.setVolume(0.0);
      expect(service.getConfig().volume).toBe(0.0);

      service.setVolume(0.5);
      expect(service.getConfig().volume).toBe(0.5);

      service.setVolume(1.0);
      expect(service.getConfig().volume).toBe(1.0);
    });
  });
});
