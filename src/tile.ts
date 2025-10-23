export enum TileColor {
  I = 'I',
  L = 'L',
  S = 'S',
  O = 'O',
}

export class Tile {
  readonly color: TileColor;
  private _shape: number[][];

  constructor(color: TileColor) {
    this.color = color;
    // Default shape is a 3x2 L
    this._shape = [[1, 0], [1, 0], [1, 1]];
  }

  get shape(): number[][] {
    return this._shape;
  }

  rotate(): void {
    const newShape: number[][] = [];
    for (let i = 0; i < this._shape[0].length; i++) {
      newShape[i] = [];
      for (let j = 0; j < this._shape.length; j++) {
        newShape[i][j] = this._shape[this._shape.length - 1 - j][i];
      }
    }
    this._shape = newShape;
  }

  flip(): void {
    const newShape: number[][] = [];
    for (let i = 0; i < this._shape.length; i++) {
      newShape[i] = [];
      for (let j = 0; j < this._shape[i].length; j++) {
        newShape[i][j] = this._shape[i][this._shape[i].length - 1 - j];
      }
    }
    this._shape = newShape;
  }
}
