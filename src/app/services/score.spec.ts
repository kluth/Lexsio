import { TestBed } from '@angular/core/testing';
import { ScoreService } from './score';
import { GameMode, GameStats, Score } from '../models/game-modes.models';

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScoreService]
    });
    service = TestBed.inject(ScoreService);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Game Stats Tracking', () => {
    it('should initialize game stats', (done) => {
      service.startGame();
      service.getGameStats().subscribe(stats => {
        expect(stats.startTime).toBeDefined();
        expect(stats.moves).toBe(0);
        expect(stats.hints).toBe(0);
        expect(stats.errors).toBe(0);
        expect(stats.completed).toBe(false);
        done();
      });
    });

    it('should increment moves', (done) => {
      service.startGame();
      service.incrementMoves();
      service.getGameStats().subscribe(stats => {
        expect(stats.moves).toBe(1);
        done();
      });
    });

    it('should increment hints', (done) => {
      service.startGame();
      service.incrementHints();
      service.getGameStats().subscribe(stats => {
        expect(stats.hints).toBe(1);
        done();
      });
    });

    it('should increment errors', (done) => {
      service.startGame();
      service.incrementErrors();
      service.getGameStats().subscribe(stats => {
        expect(stats.errors).toBe(1);
        done();
      });
    });

    it('should mark game as completed', (done) => {
      service.startGame();
      service.completeGame();
      service.getGameStats().subscribe(stats => {
        expect(stats.completed).toBe(true);
        expect(stats.endTime).toBeDefined();
        done();
      });
    });
  });

  describe('Score Calculation', () => {
    it('should calculate score based on time', () => {
      const stats: GameStats = {
        startTime: Date.now() - 60000, // 60 seconds ago
        endTime: Date.now(),
        moves: 27,
        hints: 0,
        errors: 0,
        timeElapsed: 60,
        completed: true
      };

      const score = service.calculateScore(stats, GameMode.CLASSIC, 1, 1.0);
      expect(score).toBeGreaterThan(0);
    });

    it('should penalize for errors', () => {
      const statsNoErrors: GameStats = {
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        moves: 27,
        hints: 0,
        errors: 0,
        timeElapsed: 60,
        completed: true
      };

      const statsWithErrors: GameStats = {
        ...statsNoErrors,
        errors: 5
      };

      const scoreNoErrors = service.calculateScore(statsNoErrors, GameMode.CLASSIC, 1, 1.0);
      const scoreWithErrors = service.calculateScore(statsWithErrors, GameMode.CLASSIC, 1, 1.0);

      expect(scoreNoErrors).toBeGreaterThan(scoreWithErrors);
    });

    it('should penalize for hints', () => {
      const statsNoHints: GameStats = {
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        moves: 27,
        hints: 0,
        errors: 0,
        timeElapsed: 60,
        completed: true
      };

      const statsWithHints: GameStats = {
        ...statsNoHints,
        hints: 3
      };

      const scoreNoHints = service.calculateScore(statsNoHints, GameMode.CLASSIC, 1, 1.0);
      const scoreWithHints = service.calculateScore(statsWithHints, GameMode.CLASSIC, 1, 1.0);

      expect(scoreNoHints).toBeGreaterThan(scoreWithHints);
    });

    it('should apply difficulty multiplier', () => {
      const stats: GameStats = {
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        moves: 27,
        hints: 0,
        errors: 0,
        timeElapsed: 60,
        completed: true
      };

      const scoreLevel1 = service.calculateScore(stats, GameMode.CLASSIC, 1, 1.0);
      const scoreLevel6 = service.calculateScore(stats, GameMode.CLASSIC, 6, 1.0);

      expect(scoreLevel6).toBeGreaterThan(scoreLevel1);
    });

    it('should apply mode multiplier', () => {
      const stats: GameStats = {
        startTime: Date.now() - 60000,
        endTime: Date.now(),
        moves: 27,
        hints: 0,
        errors: 0,
        timeElapsed: 60,
        completed: true
      };

      const score1x = service.calculateScore(stats, GameMode.CLASSIC, 1, 1.0);
      const score2x = service.calculateScore(stats, GameMode.CLASSIC, 1, 2.0);

      expect(score2x).toBe(score1x * 2);
    });

    it('should return 0 for incomplete games', () => {
      const stats: GameStats = {
        startTime: Date.now() - 60000,
        moves: 27,
        hints: 0,
        errors: 0,
        timeElapsed: 60,
        completed: false
      };

      const score = service.calculateScore(stats, GameMode.CLASSIC, 1, 1.0);
      expect(score).toBe(0);
    });
  });

  describe('Highscores Management', () => {
    it('should add score to highscores', (done) => {
      const score: Score = {
        id: 'test-score-1',
        playerName: 'TestPlayer',
        mode: GameMode.CLASSIC,
        difficulty: 1,
        score: 1000,
        stats: {
          startTime: Date.now() - 60000,
          endTime: Date.now(),
          moves: 27,
          hints: 0,
          errors: 0,
          timeElapsed: 60,
          completed: true
        },
        date: Date.now()
      };

      service.addScore(score);

      service.getHighscores().subscribe(highscores => {
        expect(highscores.length).toBeGreaterThan(0);
        done();
      });
    });

    it('should retrieve highscores for specific mode', () => {
      const score1: Score = {
        id: 'test-score-2',
        playerName: 'TestPlayer',
        mode: GameMode.CLASSIC,
        difficulty: 1,
        score: 1000,
        stats: {} as GameStats,
        date: Date.now()
      };

      const score2: Score = {
        id: 'test-score-3',
        playerName: 'TestPlayer',
        mode: GameMode.TIME_TRIAL,
        difficulty: 1,
        score: 1500,
        stats: {} as GameStats,
        date: Date.now()
      };

      service.addScore(score1);
      service.addScore(score2);

      const classicScores = service.getHighscoresForMode(GameMode.CLASSIC);
      const timeTrialScores = service.getHighscoresForMode(GameMode.TIME_TRIAL);

      expect(classicScores.length).toBe(1);
      expect(timeTrialScores.length).toBe(1);
      expect(classicScores[0].mode).toBe(GameMode.CLASSIC);
      expect(timeTrialScores[0].mode).toBe(GameMode.TIME_TRIAL);
    });

    it('should sort scores in descending order', () => {
      const scores: Score[] = [
        {
          id: 'test-score-4',
          playerName: 'Player1',
          mode: GameMode.CLASSIC,
          difficulty: 1,
          score: 500,
          stats: {} as GameStats,
          date: Date.now()
        },
        {
          id: 'test-score-5',
          playerName: 'Player2',
          mode: GameMode.CLASSIC,
          difficulty: 1,
          score: 1500,
          stats: {} as GameStats,
          date: Date.now()
        },
        {
          id: 'test-score-6',
          playerName: 'Player3',
          mode: GameMode.CLASSIC,
          difficulty: 1,
          score: 1000,
          stats: {} as GameStats,
          date: Date.now()
        }
      ];

      scores.forEach(score => service.addScore(score));

      const highscores = service.getHighscoresForMode(GameMode.CLASSIC);

      expect(highscores[0].score).toBe(1500);
      expect(highscores[1].score).toBe(1000);
      expect(highscores[2].score).toBe(500);
    });

    it('should clear all highscores', (done) => {
      const score: Score = {
        id: 'test-score-7',
        playerName: 'TestPlayer',
        mode: GameMode.CLASSIC,
        difficulty: 1,
        score: 1000,
        stats: {} as GameStats,
        date: Date.now()
      };

      service.addScore(score);
      service.clearHighscores();

      service.getHighscores().subscribe(highscores => {
        expect(highscores.length).toBe(0);
        done();
      });
    });
  });

  describe('Player Profile', () => {
    it('should load default player profile', (done) => {
      service.getPlayerProfile().subscribe(profile => {
        expect(profile).toBeDefined();
        expect(profile.name).toBe('Player');
        expect(profile.totalGames).toBe(0);
        expect(profile.gamesWon).toBe(0);
        expect(profile.totalScore).toBe(0);
        done();
      });
    });

    it('should update player name', (done) => {
      service.updatePlayerName('NewName');
      service.getPlayerProfile().subscribe(profile => {
        expect(profile.name).toBe('NewName');
        done();
      });
    });

    it('should update profile when score is added', (done) => {
      const score: Score = {
        id: 'test-score-8',
        playerName: 'TestPlayer',
        mode: GameMode.CLASSIC,
        difficulty: 1,
        score: 1000,
        stats: {
          startTime: Date.now(),
          endTime: Date.now(),
          moves: 27,
          hints: 0,
          errors: 0,
          timeElapsed: 60,
          completed: true
        },
        date: Date.now()
      };

      service.addScore(score);

      service.getPlayerProfile().subscribe(profile => {
        expect(profile.totalGames).toBe(1);
        expect(profile.gamesWon).toBe(1);
        expect(profile.totalScore).toBe(1000);
        done();
      });
    });
  });

  describe('Tournaments', () => {
    it('should create a tournament', (done) => {
      const tournament = {
        name: 'Test Tournament',
        description: 'A test tournament',
        mode: GameMode.CLASSIC,
        difficulty: 3,
        startTime: Date.now(),
        endTime: Date.now() + 3600000
      };

      service.createTournament(tournament);

      service.getTournaments().subscribe(tournaments => {
        expect(tournaments.length).toBeGreaterThan(0);
        expect(tournaments[0].name).toBe('Test Tournament');
        done();
      });
    });

    it('should allow joining a tournament', (done) => {
      const tournament = {
        name: 'Test Tournament 2',
        description: 'Another test tournament',
        mode: GameMode.TIME_TRIAL,
        difficulty: 3,
        startTime: Date.now(),
        endTime: Date.now() + 3600000
      };

      service.createTournament(tournament);

      service.getTournaments().subscribe(tournaments => {
        const tournamentId = tournaments[0].id;
        service.joinTournament(tournamentId);

        service.getTournaments().subscribe(updatedTournaments => {
          const joined = updatedTournaments.find(t => t.id === tournamentId);
          expect(joined!.participants.length).toBe(1);
          done();
        });
      });
    });
  });
});
