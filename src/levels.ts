import { TileColor } from './tile';

export interface Level {
  puzzledata: (TileColor | null)[][];
}

export const levels: Level[] = [
  {
    puzzledata: [
      [null, null, null, null],
      [null, TileColor.I, TileColor.I, null],
      [null, TileColor.I, TileColor.I, null],
      [null, null, null, null],
    ],
  },
  {
    puzzledata: [
      [TileColor.L, TileColor.L, null, null],
      [TileColor.L, null, null, null],
      [null, null, TileColor.S, TileColor.S],
      [null, null, null, TileColor.S],
    ],
  },
];
