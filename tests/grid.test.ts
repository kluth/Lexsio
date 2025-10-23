import { Grid } from '../src/grid';
import { Tile, TileColor } from '../src/tile';

describe('Grid', () => {
  it('should create a grid with the specified dimensions', () => {
    const grid = new Grid(10, 10);
    expect(grid.width).toBe(10);
    expect(grid.height).toBe(10);
  });

  it('should initialize the grid with empty cells', () => {
    const grid = new Grid(3, 3);
    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y < grid.height; y++) {
        expect(grid.getCell(x, y)).toBeNull();
      }
    }
  });

  it('should set and get cell values', () => {
    const grid = new Grid(5, 5);
    grid.setCell(2, 3, 'X');
    expect(grid.getCell(2, 3)).toBe('X');
  });

  it('should handle pre-filled cells', () => {
    const prefilled = [{ x: 1, y: 1, value: 'O' }];
    const grid = new Grid(4, 4, prefilled);
    expect(grid.getCell(1, 1)).toBe('O');
  });

  it('should place a tile on the grid', () => {
    const grid = new Grid(5, 5);
    const tile = new Tile(TileColor.I);
    grid.placeTile(tile, 0, 0);
    expect(grid.getCell(0, 0)).toBe(TileColor.I);
    expect(grid.getCell(0, 1)).toBe(TileColor.I);
    expect(grid.getCell(0, 2)).toBe(TileColor.I);
    expect(grid.getCell(1, 2)).toBe(TileColor.I);
  });

  it('should not place a tile if it goes out of bounds', () => {
    const grid = new Grid(3, 3);
    const tile = new Tile(TileColor.L);
    const placed = grid.placeTile(tile, 2, 0);
    expect(placed).toBe(false);
  });

  it('should not place a tile if it overlaps with another tile', () => {
    const grid = new Grid(5, 5);
    const tile1 = new Tile(TileColor.I);
    const tile2 = new Tile(TileColor.L);
    grid.placeTile(tile1, 0, 0);
    const placed = grid.placeTile(tile2, 0, 0);
    expect(placed).toBe(false);
  });

  it('should not place a tile if it touches another tile of the same color', () => {
    const grid = new Grid(5, 5);
    const tile1 = new Tile(TileColor.I);
    const tile2 = new Tile(TileColor.I);
    grid.placeTile(tile1, 0, 0); // Places at (0,0), (0,1), (0,2), (1,2)
    const placed = grid.placeTile(tile2, 1, 0);
    expect(placed).toBe(false);
  });

  it('should return true if the grid is full', () => {
    const grid = new Grid(2, 2);
    grid.setCell(0, 0, 'I');
    grid.setCell(0, 1, 'I');
    grid.setCell(1, 0, 'I');
    grid.setCell(1, 1, 'I');
    expect(grid.isFull()).toBe(true);
  });

  it('should return false if the grid is not full', () => {
    const grid = new Grid(2, 2);
    grid.setCell(0, 0, 'I');
    grid.setCell(0, 1, 'I');
    grid.setCell(1, 0, 'I');
    expect(grid.isFull()).toBe(false);
  });

  it('should return a valid hint', () => {
    const grid = new Grid(4, 4);
    const hint = grid.getHint();
    expect(hint).not.toBeNull();
    if (hint) {
      const { tile, x, y } = hint;
      expect(grid.placeTile(tile, x, y)).toBe(true);
    }
  });
});
