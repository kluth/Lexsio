import { Injectable, signal } from '@angular/core';
import * as Tone from 'tone';

import { GridCell, LTile, LixsoSymbol } from '../models/game.models';

/**
 * Generative Music System
 *
 * Every puzzle solution becomes a unique musical composition!
 * Uses Tone.js for real-time music generation based on tile placements
 */

export type MusicalScale =
  | 'major'
  | 'minor'
  | 'pentatonic'
  | 'chromatic'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian';
export type MusicGenre = 'classical' | 'jazz' | 'ambient' | 'electronic' | 'lo-fi';

export interface MusicConfig {
  enabled: boolean;
  volume: number; // 0-1
  scale: MusicalScale;
  genre: MusicGenre;
  tempo: number; // BPM
  playOnTilePlacement: boolean;
  playOnCompletion: boolean;
}

export interface TileNote {
  symbol: LixsoSymbol;
  note: string;
  duration: string;
  velocity: number;
}

const DEFAULT_CONFIG: MusicConfig = {
  enabled: true,
  volume: 0.5,
  scale: 'pentatonic',
  genre: 'ambient',
  tempo: 120,
  playOnTilePlacement: true,
  playOnCompletion: true,
};

// Musical scales in C
const SCALES: Record<MusicalScale, string[]> = {
  major: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
  minor: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
  pentatonic: ['C4', 'D4', 'E4', 'G4', 'A4', 'C5'],
  chromatic: ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'],
  dorian: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5'],
  phrygian: ['C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5'],
  lydian: ['C4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C5'],
  mixolydian: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C5'],
};

@Injectable({
  providedIn: 'root',
})
export class MusicGeneratorService {
  private config = signal<MusicConfig>(DEFAULT_CONFIG);

  private synth: Tone.PolySynth | null = null;

  private initialized = false;

  private tileNoteMapping: Map<LixsoSymbol, number> = new Map([
    [LixsoSymbol.I, 0], // Root
    [LixsoSymbol.X, 2], // Third
    [LixsoSymbol.S, 4], // Fifth
    [LixsoSymbol.O, 6], // Seventh
  ]);

  constructor() {
    this.initializeAudio();
  }

  /**
   * Initialize Tone.js audio context
   */
  private initializeAudio(): void {
    try {
      // Create polyphonic synthesizer
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.5,
          release: 0.8,
        },
      }).toDestination();

      // Set initial volume
      this.synth.volume.value = this.volumeToDb(this.config().volume);

      this.initialized = true;
    } catch (error) {
      console.error('[Music] Failed to initialize audio:', error);
    }
  }

  /**
   * Play note when tile is placed
   */
  public async playTilePlacement(tile: LTile): Promise<void> {
    if (!this.config().enabled || !this.config().playOnTilePlacement) {
      return;
    }

    await this.ensureAudioContext();

    const note = this.getTileNote(tile);
    this.playNote(note.note, note.duration, note.velocity);
  }

  /**
   * Play chord when puzzle is completed
   */
  public async playCompletionMelody(grid: GridCell[][]): Promise<void> {
    if (!this.config().enabled || !this.config().playOnCompletion) {
      return;
    }

    await this.ensureAudioContext();

    // Generate melody from completed puzzle
    const melody = this.generateMelodyFromGrid(grid);

    // Play melody
    this.playMelody(melody);
  }

  /**
   * Get note for a tile based on its symbol and position
   */
  private getTileNote(tile: LTile): TileNote {
    const scale = SCALES[this.config().scale];
    const noteIndex = this.tileNoteMapping.get(tile.symbol) || 0;

    // Add variation based on orientation (convert enum to number)
    const orientationValues = ['UP_RIGHT', 'DOWN_RIGHT', 'DOWN_LEFT', 'UP_LEFT'];
    const orientationOffset = orientationValues.indexOf(tile.orientation);
    const finalIndex = (noteIndex + orientationOffset) % scale.length;

    // Add variation based on position
    const positionVariation = (tile.anchorRow + tile.anchorCol) % 3;
    const octaveShift = positionVariation === 2 ? 12 : 0; // Shift up an octave sometimes

    return {
      symbol: tile.symbol,
      note: Tone.Frequency(scale[finalIndex]).transpose(octaveShift).toNote(),
      duration: '8n', // Eighth note
      velocity: 0.7,
    };
  }

  /**
   * Generate melody from completed grid
   */
  private generateMelodyFromGrid(grid: GridCell[][]): TileNote[] {
    const notes: TileNote[] = [];
    const scale = SCALES[this.config().scale];

    // Read grid in a musical pattern (snake pattern)
    let goingRight = true;

    for (let row = 0; row < grid.length; row++) {
      const cols = goingRight
        ? Array.from({ length: grid[row].length }, (_, i) => i)
        : Array.from({ length: grid[row].length }, (_, i) => grid[row].length - 1 - i);

      for (const col of cols) {
        const cell = grid[row][col];
        if (cell.symbol) {
          const noteIndex = (this.tileNoteMapping.get(cell.symbol) || 0) % scale.length;
          notes.push({
            symbol: cell.symbol,
            note: scale[noteIndex],
            duration: '16n', // Sixteenth note for faster playback
            velocity: cell.prefilled ? 0.5 : 0.8, // Softer for prefilled
          });
        }
      }

      goingRight = !goingRight; // Snake pattern
    }

    return notes;
  }

  /**
   * Play a single note
   */
  private playNote(note: string, duration: string = '8n', velocity: number = 0.7): void {
    if (!this.synth) return;

    const now = Tone.now();
    this.synth.triggerAttackRelease(note, duration, now, velocity);
  }

  /**
   * Play a melody (sequence of notes)
   */
  private playMelody(notes: TileNote[]): void {
    if (!this.synth || notes.length === 0) return;

    const _config = this.config();
    const noteLength = Tone.Time('16n').toSeconds(); // Convert to seconds

    // Create a sequence
    let time = Tone.now() + 0.1; // Start slightly in the future

    for (const note of notes) {
      this.synth.triggerAttackRelease(note.note, note.duration, time, note.velocity);
      time += noteLength;
    }

    // Add final chord
    const finalChord = this.createFinalChord();
    this.synth.triggerAttackRelease(finalChord, '1n', time, 0.6);
  }

  /**
   * Create a final victory chord
   */
  private createFinalChord(): string[] {
    const scale = SCALES[this.config().scale];
    return [
      scale[0], // Root
      scale[2], // Third
      scale[4], // Fifth
    ];
  }

  /**
   * Convert volume (0-1) to decibels
   */
  private volumeToDb(volume: number): number {
    if (volume === 0) return -Infinity;
    return 20 * Math.log10(volume);
  }

  /**
   * Ensure audio context is running (required for user interaction)
   */
  private async ensureAudioContext(): Promise<void> {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
  }

  /**
   * Export puzzle as MIDI file
   */
  public exportAsMIDI(grid: GridCell[][], _filename: string = 'lixso-puzzle.mid'): void {
    // This would require additional MIDI export library
    // TODO: Implement MIDI export using @tonejs/midi
    // Not yet implemented
  }

  /**
   * Public API
   */

  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.config.update((c) => ({ ...c, volume: clampedVolume }));

    if (this.synth) {
      this.synth.volume.value = this.volumeToDb(clampedVolume);
    }
  }

  public setScale(scale: MusicalScale): void {
    this.config.update((c) => ({ ...c, scale }));
  }

  public setGenre(genre: MusicGenre): void {
    this.config.update((c) => ({ ...c, genre }));
    this.applyGenreSettings(genre);
  }

  public setTempo(tempo: number): void {
    const clampedTempo = Math.max(60, Math.min(240, tempo));
    this.config.update((c) => ({ ...c, tempo: clampedTempo }));
    Tone.getTransport().bpm.value = clampedTempo;
  }

  public toggleEnabled(): void {
    this.config.update((c) => ({ ...c, enabled: !c.enabled }));
  }

  public getConfig(): MusicConfig {
    return this.config();
  }

  public updateConfig(partial: Partial<MusicConfig>): void {
    this.config.update((current) => ({ ...current, ...partial }));

    // Apply changes
    if (partial.volume !== undefined && this.synth) {
      this.synth.volume.value = this.volumeToDb(partial.volume);
    }
    if (partial.tempo !== undefined) {
      Tone.getTransport().bpm.value = partial.tempo;
    }
    if (partial.genre !== undefined) {
      this.applyGenreSettings(partial.genre);
    }
  }

  /**
   * Apply genre-specific synthesizer settings
   */
  private applyGenreSettings(genre: MusicGenre): void {
    if (!this.synth) return;

    switch (genre) {
      case 'classical':
        this.synth.set({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.8 },
        });
        break;

      case 'jazz':
        this.synth.set({
          oscillator: { type: 'triangle' },
          envelope: { attack: 0.05, decay: 0.1, sustain: 0.3, release: 0.5 },
        });
        break;

      case 'ambient':
        this.synth.set({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.5, decay: 1.0, sustain: 0.7, release: 2.0 },
        });
        break;

      case 'electronic':
        this.synth.set({
          oscillator: { type: 'square' },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 },
        });
        break;

      case 'lo-fi':
        this.synth.set({
          oscillator: { type: 'sawtooth' },
          envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.6 },
        });
        break;

      default:
        break;
    }
  }

  /**
   * Play a preview of the current settings
   */
  public async playPreview(): Promise<void> {
    await this.ensureAudioContext();

    const scale = SCALES[this.config().scale];
    const notes = [scale[0], scale[2], scale[4], scale[7] || scale[0]];

    let _time = 0;
    for (const note of notes) {
      this.playNote(note, '4n', 0.7);
      _time += 0.25;
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    Tone.getContext().dispose();
    this.initialized = false;
  }
}
