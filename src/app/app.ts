import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { GameBoard } from './components/game-board/game-board';
import { GameMenu } from './components/game-menu/game-menu';
import { GameMode } from './models/game-modes.models';

type AppView = 'menu' | 'game' | 'highscores' | 'tournaments';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, GameBoard, GameMenu],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class App {
  title = 'Lixso - Logic Puzzle Game';

  currentView: AppView = 'game'; // Start with game for now (will be 'menu' later)

  selectedMode: GameMode = GameMode.CLASSIC;

  selectedDifficulty = 3;

  onModeSelected(event: { mode: GameMode; difficulty: number }): void {
    this.selectedMode = event.mode;
    this.selectedDifficulty = event.difficulty;
    this.currentView = 'game';
  }

  onViewHighscores(): void {
    this.currentView = 'highscores';
  }

  onViewTournaments(): void {
    this.currentView = 'tournaments';
  }

  backToMenu(): void {
    this.currentView = 'menu';
  }
}
