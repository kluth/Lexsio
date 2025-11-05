import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { getPuzzleByDifficulty } from '../../data/puzzles';
import {
  GameState,
  GridCell,
  LixsoSymbol,
  LTile,
  LTileOrientation,
  SymbolColorMap,
} from '../../models/game.models';
import { Game } from '../../services/game';

@Component({
  selector: 'app-game-board',
  imports: [CommonModule],
  templateUrl: './game-board.html',
  styleUrl: './game-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class GameBoard implements OnInit, OnDestroy {
  gameState: GameState | null = null;

  selectedSymbol: LixsoSymbol = LixsoSymbol.I;

  selectedOrientation: LTileOrientation = LTileOrientation.UP_RIGHT;

  previewTile: LTile | null = null;

  currentDifficulty = 1;

  // Enum references for template
  LixsoSymbol = LixsoSymbol;

  LTileOrientation = LTileOrientation;

  SymbolColorMap = SymbolColorMap;

  private subscription?: Subscription;

  private gameService = inject(Game);

  ngOnInit(): void {
    this.subscription = this.gameService.getGameState().subscribe((state) => {
      this.gameState = state;
    });

    // Start with a level 1 puzzle
    this.startNewGame(1);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  startNewGame(difficulty: number): void {
    this.currentDifficulty = difficulty;
    const puzzle = getPuzzleByDifficulty(difficulty);
    this.gameService.startNewGame(puzzle);
    this.previewTile = null;
  }

  onCellClick(cell: GridCell): void {
    if (!this.gameState || cell.symbol !== null) {
      return;
    }

    const tile: LTile = {
      id: `tile-${Date.now()}-${Math.random()}`,
      symbol: this.selectedSymbol,
      orientation: this.selectedOrientation,
      anchorRow: cell.row,
      anchorCol: cell.col,
      placed: false,
    };

    const success = this.gameService.placeTile(tile);
    if (success) {
      this.previewTile = null;
      this.gameService.previewTilePlacement(null);
    }
  }

  onCellHover(cell: GridCell): void {
    if (!this.gameState || cell.symbol !== null) {
      this.gameService.previewTilePlacement(null);
      return;
    }

    this.previewTile = {
      id: 'preview',
      symbol: this.selectedSymbol,
      orientation: this.selectedOrientation,
      anchorRow: cell.row,
      anchorCol: cell.col,
      placed: false,
    };

    this.gameService.previewTilePlacement(this.previewTile);
  }

  onMouseLeaveGrid(): void {
    this.gameService.previewTilePlacement(null);
    this.previewTile = null;
  }

  selectSymbol(symbol: LixsoSymbol): void {
    this.selectedSymbol = symbol;
    if (this.previewTile) {
      this.previewTile.symbol = symbol;
      this.gameService.previewTilePlacement(this.previewTile);
    }
  }

  selectOrientation(orientation: LTileOrientation): void {
    this.selectedOrientation = orientation;
    if (this.previewTile) {
      this.previewTile.orientation = orientation;
      this.gameService.previewTilePlacement(this.previewTile);
    }
  }

  rotateOrientation(): void {
    const orientations = Object.values(LTileOrientation);
    const currentIndex = orientations.indexOf(this.selectedOrientation);
    const nextIndex = (currentIndex + 1) % orientations.length;
    this.selectOrientation(orientations[nextIndex]);
  }

  resetGame(): void {
    this.gameService.resetGame();
    this.previewTile = null;
  }

  getHint(): void {
    const hint = this.gameService.getHint();
    if (hint) {
      this.gameService.previewTilePlacement(hint);
      setTimeout(() => {
        this.gameService.previewTilePlacement(null);
      }, 2000);
    }
  }

  getCellClass(cell: GridCell): string {
    const classes: string[] = ['cell'];

    if (cell.symbol) {
      classes.push('filled');
      classes.push(`symbol-${cell.symbol.toLowerCase()}`);
    }

    if (cell.prefilled) {
      classes.push('prefilled');
    }

    if (cell.highlighted) {
      classes.push('highlighted');
      if (this.previewTile && this.gameService.canPlaceTile(this.previewTile)) {
        classes.push('valid-placement');
      } else {
        classes.push('invalid-placement');
      }
    }

    return classes.join(' ');
  }

  getSymbolColor(symbol: LixsoSymbol | null): string {
    return symbol ? SymbolColorMap[symbol] : 'transparent';
  }

  getOrientationDisplay(orientation: LTileOrientation): string {
    switch (orientation) {
      case LTileOrientation.UP_RIGHT:
        return '⌐';
      case LTileOrientation.DOWN_RIGHT:
        return '┐';
      case LTileOrientation.DOWN_LEFT:
        return '┌';
      case LTileOrientation.UP_LEFT:
        return '└';
      default:
        return '⌐';
    }
  }
}
