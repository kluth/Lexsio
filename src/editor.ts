import { Grid } from './grid';
import { TileColor } from './tile';

const canvas = document.getElementById('editor-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const GRID_SIZE = 9;
const CELL_SIZE = 40;

canvas.width = GRID_SIZE * CELL_SIZE;
canvas.height = GRID_SIZE * CELL_SIZE;

const grid = new Grid(GRID_SIZE, GRID_SIZE);
let selectedColor: TileColor | null = TileColor.I;

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      const cellValue = grid.getCell(x, y);
      if (cellValue) {
        ctx.fillStyle = getTileColor(cellValue);
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function getTileColor(color: string): string {
  switch (color) {
    case 'I': return 'cyan';
    case 'L': return 'orange';
    case 'S': return 'green';
    case 'O': return 'yellow';
    default: return 'white';
  }
}

const colorButtons = {
  'color-i': TileColor.I,
  'color-l': TileColor.L,
  'color-s': TileColor.S,
  'color-o': TileColor.O,
  'color-null': null,
};

for (const buttonId in colorButtons) {
  const button = document.getElementById(buttonId)!;
  button.addEventListener('click', () => {
    selectedColor = colorButtons[buttonId as keyof typeof colorButtons];
  });
}

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);
  grid.setCell(x, y, selectedColor);
  drawGrid();
});

const saveButton = document.getElementById('save-level')!;
saveButton.addEventListener('click', () => {
  const levelData = {
    puzzledata: grid.getGridData(),
  };
  const json = JSON.stringify(levelData);
  // For now, just log the JSON to the console.
  // In a real application, this would be saved to a file or a server.
  console.log(json);
});

drawGrid();
