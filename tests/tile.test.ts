import { Tile, TileColor } from '../src/tile';

describe('Tile', () => {
  it('should create a tile with a specific color', () => {
    const tile = new Tile(TileColor.I);
    expect(tile.color).toBe(TileColor.I);
  });

  it('should have a shape of an L', () => {
    const tile = new Tile(TileColor.I);
    // The shape is represented by a 2D array of 1s and 0s.
    // The L shape can be rotated. This is the default orientation.
    const expectedShape = [[1, 0], [1, 0], [1, 1]];
    expect(tile.shape).toEqual(expectedShape);
  });

  it('should rotate the tile', () => {
    const tile = new Tile(TileColor.L);
    tile.rotate();
    const expectedShape = [[1, 1, 1], [1, 0, 0]];
    expect(tile.shape).toEqual(expectedShape);
  });

  it('should flip the tile', () => {
    const tile = new Tile(TileColor.L);
    tile.flip();
    const expectedShape = [[0, 1], [0, 1], [1, 1]];
    expect(tile.shape).toEqual(expectedShape);
  });
});
