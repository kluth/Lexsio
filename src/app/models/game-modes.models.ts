// Game Modes and Highscore Models

export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME_TRIAL = 'TIME_TRIAL',
  LIMITED_MOVES = 'LIMITED_MOVES',
  PROGRESSIVE = 'PROGRESSIVE',
  ZEN = 'ZEN',
  PERFECT = 'PERFECT',
  SPEED_RUN = 'SPEED_RUN',
  MULTIPLAYER = 'MULTIPLAYER'
}

export interface GameModeConfig {
  mode: GameMode;
  name: string;
  description: string;
  icon: string;
  timeLimit?: number; // seconds
  moveLimit?: number;
  allowUndo: boolean;
  showTimer: boolean;
  showMoves: boolean;
  allowErrors: boolean;
  scoreMultiplier: number;
}

export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  [GameMode.CLASSIC]: {
    mode: GameMode.CLASSIC,
    name: 'Classic',
    description: 'Standard puzzle solving mode. Take your time and enjoy!',
    icon: '🎯',
    allowUndo: true,
    showTimer: true,
    showMoves: true,
    allowErrors: true,
    scoreMultiplier: 1.0
  },
  [GameMode.TIME_TRIAL]: {
    mode: GameMode.TIME_TRIAL,
    name: 'Time Trial',
    description: 'Race against the clock! Complete the puzzle before time runs out.',
    icon: '⏱️',
    timeLimit: 300, // 5 minutes
    allowUndo: true,
    showTimer: true,
    showMoves: true,
    allowErrors: true,
    scoreMultiplier: 1.5
  },
  [GameMode.LIMITED_MOVES]: {
    mode: GameMode.LIMITED_MOVES,
    name: 'Limited Moves',
    description: 'Complete the puzzle with a limited number of tile placements.',
    icon: '🎲',
    moveLimit: 30,
    allowUndo: false,
    showTimer: false,
    showMoves: true,
    allowErrors: true,
    scoreMultiplier: 1.8
  },
  [GameMode.PROGRESSIVE]: {
    mode: GameMode.PROGRESSIVE,
    name: 'Progressive Challenge',
    description: 'Start easy and progress through increasingly difficult puzzles!',
    icon: '📈',
    allowUndo: true,
    showTimer: true,
    showMoves: true,
    allowErrors: true,
    scoreMultiplier: 2.0
  },
  [GameMode.ZEN]: {
    mode: GameMode.ZEN,
    name: 'Zen Mode',
    description: 'Relaxing puzzle solving without pressure. No timer, no score.',
    icon: '🧘',
    allowUndo: true,
    showTimer: false,
    showMoves: false,
    allowErrors: true,
    scoreMultiplier: 0
  },
  [GameMode.PERFECT]: {
    mode: GameMode.PERFECT,
    name: 'Perfect Puzzle',
    description: 'No mistakes allowed! One wrong move and you start over.',
    icon: '💎',
    allowUndo: false,
    showTimer: true,
    showMoves: true,
    allowErrors: false,
    scoreMultiplier: 3.0
  },
  [GameMode.SPEED_RUN]: {
    mode: GameMode.SPEED_RUN,
    name: 'Speed Run',
    description: 'Solve as many puzzles as possible in 10 minutes!',
    icon: '🚀',
    timeLimit: 600, // 10 minutes
    allowUndo: true,
    showTimer: true,
    showMoves: false,
    allowErrors: true,
    scoreMultiplier: 2.5
  },
  [GameMode.MULTIPLAYER]: {
    mode: GameMode.MULTIPLAYER,
    name: 'Multiplayer',
    description: 'Compete against other players in real-time!',
    icon: '👥',
    allowUndo: false,
    showTimer: true,
    showMoves: true,
    allowErrors: true,
    scoreMultiplier: 2.0
  }
};

export interface GameStats {
  startTime: number;
  endTime?: number;
  moves: number;
  hints: number;
  errors: number;
  timeElapsed: number; // seconds
  completed: boolean;
}

export interface Score {
  id: string;
  playerName: string;
  mode: GameMode;
  difficulty: number;
  score: number;
  stats: GameStats;
  date: number; // timestamp
}

export interface Highscore {
  mode: GameMode;
  difficulty: number;
  scores: Score[];
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatar?: string;
  totalGames: number;
  gamesWon: number;
  totalScore: number;
  achievements: Achievement[];
  createdAt: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_win',
    name: 'First Victory',
    description: 'Complete your first puzzle',
    icon: '🎊'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a puzzle in under 2 minutes',
    icon: '⚡'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a puzzle without any errors',
    icon: '✨'
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Play for 60 minutes continuously',
    icon: '🏃'
  },
  {
    id: 'master_solver',
    name: 'Master Solver',
    description: 'Complete 50 puzzles',
    icon: '🏆'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'Complete a Level 6 puzzle in Perfect mode',
    icon: '👑'
  },
  {
    id: 'multiplayer_champion',
    name: 'Multiplayer Champion',
    description: 'Win 10 multiplayer games',
    icon: '🥇'
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Win 5 games in a row',
    icon: '🔥'
  }
];

// Tournament models
export interface Tournament {
  id: string;
  name: string;
  description: string;
  mode: GameMode;
  difficulty: number;
  startTime: number;
  endTime: number;
  participants: TournamentParticipant[];
  status: 'upcoming' | 'active' | 'completed';
  prize?: string;
}

export interface TournamentParticipant {
  playerId: string;
  playerName: string;
  score: number;
  rank?: number;
  completed: boolean;
}
