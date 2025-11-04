import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Score,
  Highscore,
  GameMode,
  GameStats,
  PlayerProfile,
  Achievement,
  ACHIEVEMENTS,
  Tournament,
  TournamentParticipant
} from '../models/game-modes.models';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly STORAGE_KEY_SCORES = 'lixso_highscores';
  private readonly STORAGE_KEY_PROFILE = 'lixso_player_profile';
  private readonly STORAGE_KEY_TOURNAMENTS = 'lixso_tournaments';

  private highscores$ = new BehaviorSubject<Highscore[]>(this.loadHighscores());
  private playerProfile$ = new BehaviorSubject<PlayerProfile>(this.loadPlayerProfile());
  private currentStats$ = new BehaviorSubject<GameStats>(this.initializeStats());
  private tournaments$ = new BehaviorSubject<Tournament[]>(this.loadTournaments());

  constructor() {}

  // ===== Current Game Stats =====

  getGameStats(): Observable<GameStats> {
    return this.currentStats$.asObservable();
  }

  startGame(): void {
    this.currentStats$.next(this.initializeStats());
  }

  updateStats(updates: Partial<GameStats>): void {
    const current = this.currentStats$.value;
    const updated = { ...current, ...updates };

    // Calculate time elapsed
    if (current.startTime) {
      updated.timeElapsed = Math.floor((Date.now() - current.startTime) / 1000);
    }

    this.currentStats$.next(updated);
  }

  incrementMoves(): void {
    const stats = this.currentStats$.value;
    this.updateStats({ moves: stats.moves + 1 });
  }

  incrementHints(): void {
    const stats = this.currentStats$.value;
    this.updateStats({ hints: stats.hints + 1 });
  }

  incrementErrors(): void {
    const stats = this.currentStats$.value;
    this.updateStats({ errors: stats.errors + 1 });
  }

  completeGame(): void {
    this.updateStats({ endTime: Date.now(), completed: true });
  }

  private initializeStats(): GameStats {
    return {
      startTime: Date.now(),
      moves: 0,
      hints: 0,
      errors: 0,
      timeElapsed: 0,
      completed: false
    };
  }

  // ===== Score Calculation =====

  calculateScore(stats: GameStats, mode: GameMode, difficulty: number, scoreMultiplier: number): number {
    if (!stats.completed) {
      return 0;
    }

    // Base score calculation
    let score = 1000;

    // Time bonus (faster = higher score)
    if (stats.timeElapsed > 0) {
      const timeBonus = Math.max(0, 500 - stats.timeElapsed);
      score += timeBonus;
    }

    // Move efficiency bonus
    const optimalMoves = 27; // 9x9 grid / 3 cells per tile = 27 tiles
    const moveEfficiency = Math.max(0, 300 - (stats.moves - optimalMoves) * 10);
    score += moveEfficiency;

    // Error penalty
    score -= stats.errors * 50;

    // Hint penalty
    score -= stats.hints * 30;

    // Difficulty multiplier
    score *= (1 + difficulty * 0.2);

    // Mode multiplier
    score *= scoreMultiplier;

    return Math.max(0, Math.round(score));
  }

  // ===== Highscores =====

  getHighscores(): Observable<Highscore[]> {
    return this.highscores$.asObservable();
  }

  getHighscoresForMode(mode: GameMode, difficulty?: number): Score[] {
    const highscores = this.highscores$.value;
    const modeHighscores = highscores.filter(h =>
      h.mode === mode && (difficulty === undefined || h.difficulty === difficulty)
    );

    const allScores = modeHighscores.flatMap(h => h.scores);
    return allScores.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  addScore(score: Score): void {
    const highscores = this.highscores$.value;
    let modeHighscore = highscores.find(h => h.mode === score.mode && h.difficulty === score.difficulty);

    if (!modeHighscore) {
      modeHighscore = {
        mode: score.mode,
        difficulty: score.difficulty,
        scores: []
      };
      highscores.push(modeHighscore);
    }

    modeHighscore.scores.push(score);
    modeHighscore.scores.sort((a, b) => b.score - a.score);

    // Keep only top 100 scores per mode/difficulty
    if (modeHighscore.scores.length > 100) {
      modeHighscore.scores = modeHighscore.scores.slice(0, 100);
    }

    this.saveHighscores(highscores);
    this.highscores$.next(highscores);

    // Update player profile
    this.updatePlayerProfile(score);
    this.checkAchievements(score);
  }

  clearHighscores(): void {
    this.highscores$.next([]);
    localStorage.removeItem(this.STORAGE_KEY_SCORES);
  }

  private loadHighscores(): Highscore[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SCORES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveHighscores(highscores: Highscore[]): void {
    localStorage.setItem(this.STORAGE_KEY_SCORES, JSON.stringify(highscores));
  }

  // ===== Player Profile =====

  getPlayerProfile(): Observable<PlayerProfile> {
    return this.playerProfile$.asObservable();
  }

  updatePlayerName(name: string): void {
    const profile = this.playerProfile$.value;
    profile.name = name;
    this.savePlayerProfile(profile);
    this.playerProfile$.next(profile);
  }

  private updatePlayerProfile(score: Score): void {
    const profile = this.playerProfile$.value;
    profile.totalGames++;

    if (score.stats.completed) {
      profile.gamesWon++;
    }

    profile.totalScore += score.score;

    this.savePlayerProfile(profile);
    this.playerProfile$.next(profile);
  }

  private loadPlayerProfile(): PlayerProfile {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}

    return {
      id: this.generateId(),
      name: 'Player',
      totalGames: 0,
      gamesWon: 0,
      totalScore: 0,
      achievements: [],
      createdAt: Date.now()
    };
  }

  private savePlayerProfile(profile: PlayerProfile): void {
    localStorage.setItem(this.STORAGE_KEY_PROFILE, JSON.stringify(profile));
  }

  // ===== Achievements =====

  private checkAchievements(score: Score): void {
    const profile = this.playerProfile$.value;
    const newAchievements: Achievement[] = [];

    // First Win
    if (profile.gamesWon === 1 && !this.hasAchievement('first_win')) {
      newAchievements.push(this.unlockAchievement('first_win'));
    }

    // Speed Demon
    if (score.stats.timeElapsed < 120 && !this.hasAchievement('speed_demon')) {
      newAchievements.push(this.unlockAchievement('speed_demon'));
    }

    // Perfectionist
    if (score.stats.errors === 0 && !this.hasAchievement('perfectionist')) {
      newAchievements.push(this.unlockAchievement('perfectionist'));
    }

    // Master Solver
    if (profile.gamesWon === 50 && !this.hasAchievement('master_solver')) {
      newAchievements.push(this.unlockAchievement('master_solver'));
    }

    // Grandmaster
    if (score.mode === GameMode.PERFECT && score.difficulty === 6 && !this.hasAchievement('grandmaster')) {
      newAchievements.push(this.unlockAchievement('grandmaster'));
    }

    if (newAchievements.length > 0) {
      profile.achievements.push(...newAchievements);
      this.savePlayerProfile(profile);
      this.playerProfile$.next(profile);
    }
  }

  private hasAchievement(achievementId: string): boolean {
    const profile = this.playerProfile$.value;
    return profile.achievements.some(a => a.id === achievementId);
  }

  private unlockAchievement(achievementId: string): Achievement {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      throw new Error(`Achievement ${achievementId} not found`);
    }
    return { ...achievement, unlockedAt: Date.now() };
  }

  // ===== Tournaments =====

  getTournaments(): Observable<Tournament[]> {
    return this.tournaments$.asObservable();
  }

  createTournament(tournament: Omit<Tournament, 'id' | 'participants' | 'status'>): void {
    const tournaments = this.tournaments$.value;
    const newTournament: Tournament = {
      ...tournament,
      id: this.generateId(),
      participants: [],
      status: tournament.startTime > Date.now() ? 'upcoming' : 'active'
    };

    tournaments.push(newTournament);
    this.saveTournaments(tournaments);
    this.tournaments$.next(tournaments);
  }

  joinTournament(tournamentId: string): void {
    const tournaments = this.tournaments$.value;
    const tournament = tournaments.find(t => t.id === tournamentId);
    const profile = this.playerProfile$.value;

    if (tournament && !tournament.participants.some(p => p.playerId === profile.id)) {
      tournament.participants.push({
        playerId: profile.id,
        playerName: profile.name,
        score: 0,
        completed: false
      });

      this.saveTournaments(tournaments);
      this.tournaments$.next(tournaments);
    }
  }

  submitTournamentScore(tournamentId: string, score: number): void {
    const tournaments = this.tournaments$.value;
    const tournament = tournaments.find(t => t.id === tournamentId);
    const profile = this.playerProfile$.value;

    if (tournament) {
      const participant = tournament.participants.find(p => p.playerId === profile.id);
      if (participant) {
        participant.score = score;
        participant.completed = true;

        // Update rankings
        tournament.participants.sort((a, b) => b.score - a.score);
        tournament.participants.forEach((p, index) => {
          p.rank = index + 1;
        });

        this.saveTournaments(tournaments);
        this.tournaments$.next(tournaments);
      }
    }
  }

  private loadTournaments(): Tournament[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_TOURNAMENTS);
      if (stored) {
        const tournaments: Tournament[] = JSON.parse(stored);

        // Update tournament statuses
        tournaments.forEach(t => {
          const now = Date.now();
          if (t.endTime < now) {
            t.status = 'completed';
          } else if (t.startTime <= now && t.endTime > now) {
            t.status = 'active';
          } else {
            t.status = 'upcoming';
          }
        });

        return tournaments;
      }
    } catch {}

    return [];
  }

  private saveTournaments(tournaments: Tournament[]): void {
    localStorage.setItem(this.STORAGE_KEY_TOURNAMENTS, JSON.stringify(tournaments));
  }

  // ===== Utilities =====

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}
