import { Grid } from './grid';
import { Tile, TileColor } from './tile';
import { levels } from './levels';

const canvas = document.getElementById('grid-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

const CELL_SIZE = 40;

const grid = new Grid(0, 0);

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0; x < grid.width; x++) {
    for (let y = 0; y < grid.height; y++) {
      ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      const cellValue = grid.getCell(x, y);
      if (cellValue) {
        ctx.fillStyle = getTileColor(cellValue);
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function loadLevel(levelIndex: number) {
  grid.loadLevel(levels[levelIndex]);
  canvas.width = grid.width * CELL_SIZE;
  canvas.height = grid.height * CELL_SIZE;
  drawGrid();
}

for (let i = 0; i < levels.length; i++) {
  const button = document.getElementById(`level-${i}`)!;
  button.addEventListener('click', () => {
    loadLevel(i);
  });
}

let selectedColor: TileColor = TileColor.I;
let previewTile: Tile = new Tile(selectedColor);

const colorButtons = {
  'color-i': TileColor.I,
  'color-l': TileColor.L,
  'color-s': TileColor.S,
  'color-o': TileColor.O,
};

for (const buttonId in colorButtons) {
  const button = document.getElementById(buttonId)!;
  button.addEventListener('click', () => {
    selectedColor = colorButtons[buttonId as keyof typeof colorButtons];
    previewTile = new Tile(selectedColor);
  });
}

const rotateButton = document.getElementById('rotate')!;
rotateButton.addEventListener('click', () => {
  previewTile.rotate();
});

const flipButton = document.getElementById('flip')!;
flipButton.addEventListener('click', () => {
  previewTile.flip();
});

canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
  const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);

  if (grid.placeTile(previewTile, x, y)) {
    previewTile = new Tile(selectedColor);
    drawGrid();
    if (grid.isFull()) {
      stopTimer();
      alert(`You won in ${seconds} seconds!`);
    }
  }
});

function getTileColor(color: string): string {
  switch (color) {
    case 'I': return 'cyan';
    case 'L': return 'orange';
    case 'S': return 'green';
    case 'O': return 'yellow';
    default: return 'white';
  }
}

// Load the first level by default
loadLevel(0);

const hintButton = document.getElementById('hint')!;
hintButton.addEventListener('click', () => {
  const hint = grid.getHint();
  if (hint) {
    const { tile, x, y } = hint;
    grid.placeTile(tile, x, y);
    drawGrid();
  }
});

// Time Attack Mode
const startButton = document.getElementById('start-time-attack')!;
const timerDiv = document.getElementById('timer')!;
let timerInterval: number | null = null;
let seconds = 0;

function startTimer() {
  seconds = 0;
  timerDiv.textContent = `Time: ${seconds}s`;
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  timerInterval = window.setInterval(() => {
    seconds++;
    timerDiv.textContent = `Time: ${seconds}s`;
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

startButton.addEventListener('click', () => {
  // For time attack, we can use a pre-defined empty grid or a random one.
  // For now, let's use a 9x9 empty grid.
  grid.width = 9;
  grid.height = 9;
  grid.clear();
  canvas.width = grid.width * CELL_SIZE;
  canvas.height = grid.height * CELL_SIZE;
  drawGrid();
  startTimer();
});
