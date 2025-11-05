// Dopamine Loop Service
// Implements ethical engagement loops based on behavioral psychology research
// Key principle: Dopamine released during ANTICIPATION, not reward

import { Injectable, signal } from '@angular/core';
import {
  Reward,
  RewardTier,
  AnticipationEffect,
  AnticipationLevel,
  VisualEffect,
  AudioEffect,
  Goal,
  PlayerAction,
  EngagementMetrics,
  RewardProbabilities,
  DopamineLoopConfig,
  DopamineLoopState,
  PlayerProgress,
  RewardMultipliers,
  DEFAULT_DOPAMINE_CONFIG
} from '../models/dopamine-loop.models';

interface MicroFeedback {
  message: string;
  type: 'positive' | 'neutral' | 'negative';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class DopamineLoopService {
  private state!: ReturnType<typeof signal<DopamineLoopState>>;
  private config: DopamineLoopConfig;
  private actionHistory: PlayerAction[] = [];
  private readonly STORAGE_KEY = 'lixso_dopamine_loop_state';
  private readonly HOUR_MS = 60 * 60 * 1000;

  constructor() {
    this.config = { ...DEFAULT_DOPAMINE_CONFIG };
    this.initializeState();
    this.loadState();
  }

  private initializeState(): void {
    this.state = signal<DopamineLoopState>({
      isActive: false,
      currentPhase: 'idle',
      rewardsThisHour: 0,
      totalRewardsGiven: 0,
      isOptedOut: false,
      config: this.config
    });
  }

  /**
   * PHASE 1: Build Anticipation
   * Research: Dopamine released during anticipation, not reward
   */
  buildAnticipation(progressPercent: number): AnticipationEffect {
    let level: AnticipationLevel;
    let intensity: number;

    if (progressPercent >= 95) {
      level = 'peak';
      intensity = 1.0;
    } else if (progressPercent >= 80) {
      level = 'high';
      intensity = 0.8;
    } else if (progressPercent >= 60) {
      level = 'medium';
      intensity = 0.5;
    } else {
      level = 'low';
      intensity = 0.3;
    }

    const visualEffects: VisualEffect[] = [
      {
        type: 'glow',
        intensity,
        color: level === 'peak' ? '#FFD700' : '#7BA3D9',
        duration: this.config.anticipationDuration
      },
      {
        type: 'pulse',
        intensity: intensity * 0.8,
        duration: this.config.anticipationDuration
      }
    ];

    const audioEffects: AudioEffect[] = [
      {
        type: 'ascending-tone',
        volume: intensity * 0.6,
        duration: this.config.anticipationDuration
      }
    ];

    this.updatePhase('anticipation');

    return {
      level,
      progressPercent,
      visualEffects,
      audioEffects,
      duration: this.config.anticipationDuration
    };
  }

  /**
   * Show progress toward reward goal
   */
  showProgressTowardReward(goal: Goal): void {
    if (goal.progressPercent >= 80) {
      this.buildAnticipation(goal.progressPercent);
    }
  }

  /**
   * PHASE 2: Track Player Engagement
   */
  trackPlayerEngagement(): EngagementMetrics {
    const now = new Date();
    const recentActions = this.actionHistory.filter(a =>
      now.getTime() - a.timestamp.getTime() < 60000 // Last minute
    );

    const actionsPerMinute = recentActions.length;
    const sessionDuration = this.calculateSessionDuration();

    // Flow state detection: consistent high engagement
    const flowStateDetected = actionsPerMinute >= 10 && recentActions.length >= 10;

    const focusScore = Math.min(100, actionsPerMinute * 8);

    return {
      sessionDuration,
      actionsPerMinute,
      focusScore,
      flowStateDetected,
      lastActionTimestamp: this.actionHistory[this.actionHistory.length - 1]?.timestamp || now
    };
  }

  /**
   * Provide immediate micro-feedback for player actions
   */
  provideMicroFeedback(action: PlayerAction): MicroFeedback {
    this.actionHistory.push(action);
    this.updatePhase('activity');

    // Keep only last 100 actions
    if (this.actionHistory.length > 100) {
      this.actionHistory = this.actionHistory.slice(-100);
    }

    const feedbackMap: Record<string, MicroFeedback> = {
      'tile-placed': {
        message: 'Good move!',
        type: 'positive',
        duration: 500
      },
      'tile-removed': {
        message: 'Tile removed',
        type: 'neutral',
        duration: 300
      },
      'puzzle-completed': {
        message: 'Puzzle complete! 🎉',
        type: 'positive',
        duration: 2000
      },
      'hint-used': {
        message: 'Hint used',
        type: 'neutral',
        duration: 1000
      },
      'error-made': {
        message: 'Try again',
        type: 'negative',
        duration: 800
      }
    };

    return feedbackMap[action.type] || {
      message: 'Action recorded',
      type: 'neutral',
      duration: 500
    };
  }

  /**
   * PHASE 3: Calculate Reward (Variable Ratio Schedule)
   * Research: Variable rewards create strongest engagement
   */
  calculateReward(baseValue: number): Reward {
    const random = Math.random();
    let tier: RewardTier;

    // Probability distribution
    if (random < 0.001) {
      tier = 'legendary'; // 0.1%
    } else if (random < 0.02) {
      tier = 'mega';      // 1.9%
    } else if (random < 0.10) {
      tier = 'super';     // 8%
    } else if (random < 0.40) {
      tier = 'bonus';     // 30%
    } else {
      tier = 'standard';  // 60%
    }

    const multiplier = RewardMultipliers[tier];
    const value = Math.floor(baseValue * multiplier);

    const descriptions: Record<RewardTier, string> = {
      standard: 'Good job!',
      bonus: 'Bonus reward! 🌟',
      super: 'Super reward! ⭐⭐',
      mega: 'MEGA REWARD! 💎',
      legendary: 'LEGENDARY REWARD!!! 👑'
    };

    const displayDurations: Record<RewardTier, number> = {
      standard: 1000,
      bonus: 1500,
      super: 2000,
      mega: 3000,
      legendary: 5000
    };

    return {
      id: `reward-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: tier,
      value,
      multiplier,
      description: descriptions[tier],
      granted: new Date(),
      displayDuration: displayDurations[tier]
    };
  }

  /**
   * Deliver reward to player
   */
  deliverReward(reward: Reward): boolean {
    const currentState = this.state();

    // Check opt-out
    if (currentState.isOptedOut) {
      return false;
    }

    // Check cooldown and limits
    if (!this.checkCooldown()) {
      return false;
    }

    // Update state
    this.state.update(s => ({
      ...s,
      currentPhase: 'reward',
      lastRewardTime: reward.granted,
      rewardsThisHour: s.rewardsThisHour + 1,
      totalRewardsGiven: s.totalRewardsGiven + 1
    }));

    this.saveState();

    // Auto-transition to cooldown after display duration
    setTimeout(() => {
      this.updatePhase('cooldown');
      setTimeout(() => {
        this.updatePhase('idle');
      }, this.config.cooldownBetweenLoops);
    }, reward.displayDuration);

    return true;
  }

  /**
   * ETHICAL SAFEGUARD: Check cooldown and limits
   */
  checkCooldown(): boolean {
    const currentState = this.state();
    const now = new Date();

    // Check if opted out
    if (currentState.isOptedOut) {
      return false;
    }

    // Check hourly limit
    if (currentState.rewardsThisHour >= this.config.maxRewardsPerHour) {
      // Check if hour has passed
      if (currentState.lastRewardTime) {
        const timeSinceLastReward = now.getTime() - currentState.lastRewardTime.getTime();
        if (timeSinceLastReward >= this.HOUR_MS) {
          // Reset hourly count
          this.state.update(s => ({ ...s, rewardsThisHour: 0 }));
          return true;
        }
      }
      return false;
    }

    // Check cooldown period
    if (currentState.lastRewardTime) {
      const timeSinceLastReward = now.getTime() - currentState.lastRewardTime.getTime();
      if (timeSinceLastReward < this.config.cooldownBetweenLoops) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get transparent probability information
   */
  getTransparentOdds(): RewardProbabilities {
    return {
      standard: 0.60,
      bonus: 0.30,
      super: 0.08,
      mega: 0.019,
      legendary: 0.001
    };
  }

  /**
   * Opt out of dopamine loops
   */
  optOut(): void {
    this.state.update(s => ({ ...s, isOptedOut: true }));
    this.saveState();
  }

  /**
   * Opt back in
   */
  optIn(): void {
    this.state.update(s => ({ ...s, isOptedOut: false }));
    this.saveState();
  }

  /**
   * Suggest next goal based on player progress
   */
  suggestNextGoal(progress: PlayerProgress): Goal {
    const difficulty = Math.floor(progress.skillLevel / 10);

    const goalTemplates = [
      {
        description: `Complete ${5 + difficulty} more puzzles`,
        targetValue: 5 + difficulty,
        category: 'puzzle' as const
      },
      {
        description: `Reach ${progress.totalScore + (1000 * (difficulty + 1))} points`,
        targetValue: progress.totalScore + (1000 * (difficulty + 1)),
        category: 'score' as const
      },
      {
        description: `Maintain a ${3 + difficulty} day streak`,
        targetValue: 3 + difficulty,
        category: 'streak' as const
      }
    ];

    const template = goalTemplates[Math.floor(Math.random() * goalTemplates.length)];

    return {
      id: `goal-${Date.now()}`,
      description: template.description,
      targetValue: template.targetValue,
      currentValue: 0,
      progressPercent: 0,
      category: template.category,
      difficulty,
      estimatedTime: template.targetValue * 180 // 3 minutes per unit
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): DopamineLoopConfig {
    return { ...this.config };
  }

  /**
   * Get current state
   */
  getState(): DopamineLoopState {
    return this.state();
  }

  /**
   * Update current phase
   */
  private updatePhase(phase: DopamineLoopState['currentPhase']): void {
    this.state.update(s => ({
      ...s,
      currentPhase: phase,
      isActive: phase !== 'idle'
    }));
  }

  /**
   * Calculate session duration
   */
  private calculateSessionDuration(): number {
    if (this.actionHistory.length === 0) {
      return 0;
    }

    const first = this.actionHistory[0].timestamp.getTime();
    const last = this.actionHistory[this.actionHistory.length - 1].timestamp.getTime();

    return (last - first) / 1000; // seconds
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    const stateToSave = {
      ...this.state(),
      lastRewardTime: this.state().lastRewardTime?.toISOString()
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.state.update(s => ({
          ...s,
          ...parsed,
          lastRewardTime: parsed.lastRewardTime ? new Date(parsed.lastRewardTime) : undefined
        }));
      } catch (e) {
        console.error('Failed to load dopamine loop state', e);
      }
    }
  }
}
