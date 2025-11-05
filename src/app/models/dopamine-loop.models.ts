// Dopamine Loop & Compulsion Cycle Models
// Based on research: Dopamine released during ANTICIPATION, not reward
// Variable ratio rewards create strongest engagement (Skinner box principle)

export type RewardTier = 'standard' | 'bonus' | 'super' | 'mega' | 'legendary';
export type AnticipationLevel = 'low' | 'medium' | 'high' | 'peak';

export interface Reward {
  id: string;
  type: RewardTier;
  value: number;
  multiplier: number;
  description: string;
  granted: Date;
  displayDuration: number; // milliseconds
}

export interface AnticipationEffect {
  level: AnticipationLevel;
  progressPercent: number;
  visualEffects: VisualEffect[];
  audioEffects: AudioEffect[];
  duration: number; // milliseconds
}

export interface VisualEffect {
  type: 'glow' | 'pulse' | 'shimmer' | 'particle' | 'shake';
  intensity: number; // 0-1
  color?: string;
  duration: number;
}

export interface AudioEffect {
  type: 'ascending-tone' | 'celebration' | 'chime' | 'whoosh';
  volume: number; // 0-1
  duration: number;
}

export interface Goal {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progressPercent: number;
  category: 'puzzle' | 'score' | 'streak' | 'social' | 'achievement';
  difficulty: number; // 1-10
  estimatedTime?: number; // seconds
}

export interface PlayerAction {
  type: 'tile-placed' | 'tile-removed' | 'puzzle-completed' | 'hint-used' | 'error-made';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface EngagementMetrics {
  sessionDuration: number; // seconds
  actionsPerMinute: number;
  focusScore: number; // 0-100
  flowStateDetected: boolean;
  lastActionTimestamp: Date;
}

export interface RewardProbabilities {
  standard: number; // 60%
  bonus: number; // 30%
  super: number; // 8%
  mega: number; // 1.9%
  legendary: number; // 0.1%
}

export interface DopamineLoopConfig {
  maxRewardsPerHour: number; // Limit: 12 (every 5 min)
  cooldownBetweenLoops: number; // Minimum: 30 seconds
  requireRealProgress: boolean; // No fake rewards
  transparentProbabilities: boolean; // Show odds
  enableOptOut: boolean; // Allow disabling
  anticipationDuration: number; // milliseconds (500-1000ms)
}

export interface DopamineLoopState {
  isActive: boolean;
  currentPhase: 'idle' | 'anticipation' | 'activity' | 'reward' | 'cooldown';
  lastRewardTime?: Date;
  rewardsThisHour: number;
  totalRewardsGiven: number;
  isOptedOut: boolean;
  config: DopamineLoopConfig;
}

export interface PlayerProgress {
  level: number;
  totalScore: number;
  completedPuzzles: number;
  currentStreak: number;
  achievements: string[];
  skillLevel: number; // 0-100
}

// Reward value multipliers based on tier
export const RewardMultipliers: Record<RewardTier, number> = {
  standard: 1.0,
  bonus: 1.2,
  super: 2.0,
  mega: 5.0,
  legendary: 10.0,
};

// Dopamine impact percentages (relative to baseline)
export const DopamineImpact: Record<RewardTier, number> = {
  standard: 0, // Baseline
  bonus: 30, // +30%
  super: 80, // +80%
  mega: 200, // +200%
  legendary: 500, // +500%
};

// Default ethical configuration
export const DEFAULT_DOPAMINE_CONFIG: DopamineLoopConfig = {
  maxRewardsPerHour: 12,
  cooldownBetweenLoops: 30000, // 30 seconds
  requireRealProgress: true,
  transparentProbabilities: true,
  enableOptOut: true,
  anticipationDuration: 750,
};
