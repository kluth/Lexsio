(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grid = void 0;
const tile_1 = require("./tile");
class Grid {
    constructor(width, height, prefilled = []) {
        this.width = width;
        this.height = height;
        this.grid = Array(width).fill(null).map(() => Array(height).fill(null));
        for (const cell of prefilled) {
            this.setCell(cell.x, cell.y, cell.value);
        }
    }
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }
        return this.grid[x][y];
    }
    setCell(x, y, value) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return;
        }
        this.grid[x][y] = value;
    }
    placeTile(tile, x, y) {
        // Check for out of bounds and overlap
        for (let i = 0; i < tile.shape.length; i++) {
            for (let j = 0; j < tile.shape[i].length; j++) {
                if (tile.shape[i][j] === 1) {
                    const newX = x + j;
                    const newY = y + i;
                    if (newX >= this.width || newY >= this.height || this.getCell(newX, newY) !== null) {
                        return false;
                    }
                }
            }
        }
        // Place the tile
        for (let i = 0; i < tile.shape.length; i++) {
            for (let j = 0; j < tile.shape[i].length; j++) {
                if (tile.shape[i][j] === 1) {
                    this.setCell(x + j, y + i, tile.color);
                }
            }
        }
        // Check for the 'no touching' rule
        for (let i = 0; i < tile.shape.length; i++) {
            for (let j = 0; j < tile.shape[i].length; j++) {
                if (tile.shape[i][j] === 1) {
                    const newX = x + j;
                    const newY = y + i;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            if (dx === 0 && dy === 0)
                                continue;
                            const neighborX = newX + dx;
                            const neighborY = newY + dy;
                            // Check if the neighbor is part of the same tile
                            let isPartOfTile = false;
                            for (let ti = 0; ti < tile.shape.length; ti++) {
                                for (let tj = 0; tj < tile.shape[ti].length; tj++) {
                                    if (tile.shape[ti][tj] === 1 && x + tj === neighborX && y + ti === neighborY) {
                                        isPartOfTile = true;
                                        break;
                                    }
                                }
                                if (isPartOfTile)
                                    break;
                            }
                            if (!isPartOfTile && this.getCell(neighborX, neighborY) === tile.color) {
                                this.removeTile(tile, x, y);
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
    removeTile(tile, x, y) {
        for (let i = 0; i < tile.shape.length; i++) {
            for (let j = 0; j < tile.shape[i].length; j++) {
                if (tile.shape[i][j] === 1) {
                    this.setCell(x + j, y + i, null);
                }
            }
        }
    }
    isFull() {
        for (let i = 0; i < this.width; i++) {
            for (let j = 0; j < this.height; j++) {
                if (this.getCell(i, j) === null) {
                    return false;
                }
            }
        }
        return true;
    }
    clear() {
        this.grid = Array(this.width).fill(null).map(() => Array(this.height).fill(null));
    }
    clone() {
        const newGrid = new Grid(this.width, this.height);
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                newGrid.setCell(x, y, this.getCell(x, y));
            }
        }
        return newGrid;
    }
    getGridData() {
        return this.grid;
    }
    getHint() {
        const allTiles = [];
        for (const color of Object.values(tile_1.TileColor)) {
            for (let i = 0; i < 4; i++) {
                const tile = new tile_1.Tile(color);
                for (let j = 0; j < i; j++) {
                    tile.rotate();
                }
                allTiles.push(tile);
                const flippedTile = new tile_1.Tile(color);
                for (let j = 0; j < i; j++) {
                    flippedTile.rotate();
                }
                flippedTile.flip();
                allTiles.push(flippedTile);
            }
        }
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.getCell(x, y) === null) {
                    for (const tile of allTiles) {
                        const tempGrid = this.clone();
                        if (tempGrid.placeTile(tile, x, y)) {
                            return { tile, x, y };
                        }
                    }
                }
            }
        }
        return null;
    }
    loadLevel(level) {
        const puzzleGrid = level.puzzledata;
        this.width = puzzleGrid[0].length;
        this.height = puzzleGrid.length;
        this.grid = Array(this.width).fill(null).map(() => Array(this.height).fill(null));
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.setCell(x, y, puzzleGrid[y][x]);
            }
        }
    }
}
exports.Grid = Grid;

},{"./tile":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.levels = void 0;
const tile_1 = require("./tile");
exports.levels = [
    {
        puzzledata: [
            [null, null, null, null],
            [null, tile_1.TileColor.I, tile_1.TileColor.I, null],
            [null, tile_1.TileColor.I, tile_1.TileColor.I, null],
            [null, null, null, null],
        ],
    },
    {
        puzzledata: [
            [tile_1.TileColor.L, tile_1.TileColor.L, null, null],
            [tile_1.TileColor.L, null, null, null],
            [null, null, tile_1.TileColor.S, tile_1.TileColor.S],
            [null, null, null, tile_1.TileColor.S],
        ],
    },
];

},{"./tile":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grid_1 = require("./grid");
const tile_1 = require("./tile");
const levels_1 = require("./levels");
const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 40;
const grid = new grid_1.Grid(0, 0);
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
function loadLevel(levelIndex) {
    grid.loadLevel(levels_1.levels[levelIndex]);
    canvas.width = grid.width * CELL_SIZE;
    canvas.height = grid.height * CELL_SIZE;
    drawGrid();
}
for (let i = 0; i < levels_1.levels.length; i++) {
    const button = document.getElementById(`level-${i}`);
    button.addEventListener('click', () => {
        loadLevel(i);
    });
}
let selectedColor = tile_1.TileColor.I;
let previewTile = new tile_1.Tile(selectedColor);
const colorButtons = {
    'color-i': tile_1.TileColor.I,
    'color-l': tile_1.TileColor.L,
    'color-s': tile_1.TileColor.S,
    'color-o': tile_1.TileColor.O,
};
for (const buttonId in colorButtons) {
    const button = document.getElementById(buttonId);
    button.addEventListener('click', () => {
        selectedColor = colorButtons[buttonId];
        previewTile = new tile_1.Tile(selectedColor);
    });
}
const rotateButton = document.getElementById('rotate');
rotateButton.addEventListener('click', () => {
    previewTile.rotate();
});
const flipButton = document.getElementById('flip');
flipButton.addEventListener('click', () => {
    previewTile.flip();
});
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((event.clientY - rect.top) / CELL_SIZE);
    if (grid.placeTile(previewTile, x, y)) {
        previewTile = new tile_1.Tile(selectedColor);
        drawGrid();
        if (grid.isFull()) {
            stopTimer();
            alert(`You won in ${seconds} seconds!`);
        }
    }
});
function getTileColor(color) {
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
const hintButton = document.getElementById('hint');
hintButton.addEventListener('click', () => {
    const hint = grid.getHint();
    if (hint) {
        const { tile, x, y } = hint;
        grid.placeTile(tile, x, y);
        drawGrid();
    }
});
// Time Attack Mode
const startButton = document.getElementById('start-time-attack');
const timerDiv = document.getElementById('timer');
let timerInterval = null;
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

},{"./grid":1,"./levels":2,"./tile":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tile = exports.TileColor = void 0;
var TileColor;
(function (TileColor) {
    TileColor["I"] = "I";
    TileColor["L"] = "L";
    TileColor["S"] = "S";
    TileColor["O"] = "O";
})(TileColor || (exports.TileColor = TileColor = {}));
class Tile {
    constructor(color) {
        this.color = color;
        // Default shape is a 3x2 L
        this._shape = [[1, 0], [1, 0], [1, 1]];
    }
    get shape() {
        return this._shape;
    }
    rotate() {
        const newShape = [];
        for (let i = 0; i < this._shape[0].length; i++) {
            newShape[i] = [];
            for (let j = 0; j < this._shape.length; j++) {
                newShape[i][j] = this._shape[this._shape.length - 1 - j][i];
            }
        }
        this._shape = newShape;
    }
    flip() {
        const newShape = [];
        for (let i = 0; i < this._shape.length; i++) {
            newShape[i] = [];
            for (let j = 0; j < this._shape[i].length; j++) {
                newShape[i][j] = this._shape[i][this._shape[i].length - 1 - j];
            }
        }
        this._shape = newShape;
    }
}
exports.Tile = Tile;

},{}]},{},[3]);
