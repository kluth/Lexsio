// Lixso Game Models

export enum LixsoSymbol {
  I = 'I',
  X = 'X',
  S = 'S',
  O = 'O'
}

export enum LixsoColor {
  YELLOW = '#FFD700',
  RED = '#DC143C',
  GREEN = '#32CD32',
  BLUE = '#4169E1'
}

export const SymbolColorMap: Record<LixsoSymbol, LixsoColor> = {
  [LixsoSymbol.I]: LixsoColor.YELLOW,
  [LixsoSymbol.X]: LixsoColor.RED,
  [LixsoSymbol.S]: LixsoColor.GREEN,
  [LixsoSymbol.O]: LixsoColor.BLUE
};

// L-Tile orientations (4 rotations of L-shape)
// Each orientation defines relative positions from anchor point (0,0)
export enum LTileOrientation {
  UP_RIGHT = 'UP_RIGHT',       // ■□
                                // ■
  DOWN_RIGHT = 'DOWN_RIGHT',   // ■
                                // ■□
  DOWN_LEFT = 'DOWN_LEFT',     //  □■
                                //  ■
  UP_LEFT = 'UP_LEFT'          //  ■
                                // □■
}

// Relative cell positions for each L-shape orientation
export const LShapePositions: Record<LTileOrientation, Array<{row: number, col: number}>> = {
  [LTileOrientation.UP_RIGHT]: [
    {row: 0, col: 0},  // anchor
    {row: 1, col: 0},  // down
    {row: 1, col: 1}   // right
  ],
  [LTileOrientation.DOWN_RIGHT]: [
    {row: 0, col: 0},  // anchor
    {row: -1, col: 0}, // up
    {row: -1, col: 1}  // right
  ],
  [LTileOrientation.DOWN_LEFT]: [
    {row: 0, col: 0},  // anchor
    {row: -1, col: 0}, // up
    {row: -1, col: -1} // left
  ],
  [LTileOrientation.UP_LEFT]: [
    {row: 0, col: 0},  // anchor
    {row: 1, col: 0},  // down
    {row: 1, col: -1}  // left
  ]
};

export interface GridCell {
  row: number;
  col: number;
  symbol: LixsoSymbol | null;
  prefilled: boolean; // Pre-filled cells in the puzzle
  highlighted: boolean; // For UI highlighting
}

export interface LTile {
  id: string;
  symbol: LixsoSymbol;
  orientation: LTileOrientation;
  anchorRow: number;
  anchorCol: number;
  placed: boolean;
}

export interface GameState {
  grid: GridCell[][];
  gridSize: number;
  placedTiles: LTile[];
  currentTile: LTile | null;
  difficulty: number; // 1-6
  completed: boolean;
}

export interface PuzzleDefinition {
  gridSize: number;
  difficulty: number;
  prefilledCells: Array<{row: number, col: number, symbol: LixsoSymbol}>;
  solution?: LTile[]; // Optional: for validation
}
