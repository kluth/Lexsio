import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameMode, GAME_MODE_CONFIGS, GameModeConfig } from '../../models/game-modes.models';
import { ScoreService } from '../../services/score';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-game-menu',
  imports: [CommonModule],
  templateUrl: './game-menu.html',
  styleUrl: './game-menu.scss',
  standalone: true
})
export class GameMenu implements OnInit {
  @Output() modeSelected = new EventEmitter<{ mode: GameMode, difficulty: number }>();
  @Output() viewHighscores = new EventEmitter<void>();
  @Output() viewTournaments = new EventEmitter<void>();

  gameModes: GameModeConfig[] = [];
  selectedDifficulty = 3;
  playerName = 'Player';

  constructor(private scoreService: ScoreService) {}

  ngOnInit(): void {
    this.gameModes = Object.values(GAME_MODE_CONFIGS).filter(mode =>
      mode.mode !== GameMode.MULTIPLAYER // Multiplayer shown separately
    );

    this.scoreService.getPlayerProfile().subscribe(profile => {
      this.playerName = profile.name;
    });
  }

  selectMode(mode: GameMode): void {
    this.modeSelected.emit({ mode, difficulty: this.selectedDifficulty });
  }

  onViewHighscores(): void {
    this.viewHighscores.emit();
  }

  onViewTournaments(): void {
    this.viewTournaments.emit();
  }

  updatePlayerName(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.scoreService.updatePlayerName(input.value);
  }
}
