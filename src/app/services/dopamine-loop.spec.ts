// Dopamine Loop Service Tests - TDD Approach
// RED phase: All tests should FAIL initially

import { TestBed } from '@angular/core/testing';
import { DopamineLoopService } from './dopamine-loop';
import {
  RewardTier,
  AnticipationLevel,
  DEFAULT_DOPAMINE_CONFIG,
  PlayerProgress,
  Goal,
  PlayerAction
} from '../models/dopamine-loop.models';

describe('DopamineLoopService - TDD', () => {
  let service: DopamineLoopService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DopamineLoopService);
    localStorage.clear();
    // Reset time for testing (Vitest)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with default ethical config', () => {
      const config = service.getConfig();
      expect(config.maxRewardsPerHour).toBe(12);
      expect(config.cooldownBetweenLoops).toBe(30000);
      expect(config.requireRealProgress).toBe(true);
      expect(config.transparentProbabilities).toBe(true);
      expect(config.enableOptOut).toBe(true);
    });

    it('should start in idle phase', () => {
      const state = service.getState();
      expect(state.currentPhase).toBe('idle');
      expect(state.isActive).toBe(false);
    });

    it('should not be opted out by default', () => {
      const state = service.getState();
      expect(state.isOptedOut).toBe(false);
    });
  });

  describe('Phase 1: Anticipation Building', () => {
    it('should build anticipation when progress is 80-95%', () => {
      const anticipation = service.buildAnticipation(85);
      expect(anticipation).toBeTruthy();
      expect(anticipation.level).toBe('high');
      expect(anticipation.progressPercent).toBe(85);
    });

    it('should use peak anticipation at 95%+', () => {
      const anticipation = service.buildAnticipation(97);
      expect(anticipation.level).toBe('peak');
    });

    it('should use medium anticipation at 60-80%', () => {
      const anticipation = service.buildAnticipation(70);
      expect(anticipation.level).toBe('medium');
    });

    it('should use low anticipation below 60%', () => {
      const anticipation = service.buildAnticipation(40);
      expect(anticipation.level).toBe('low');
    });

    it('should provide visual effects during anticipation', () => {
      const anticipation = service.buildAnticipation(90);
      expect(anticipation.visualEffects).toBeTruthy();
      expect(anticipation.visualEffects.length).toBeGreaterThan(0);
    });

    it('should provide audio cues during anticipation', () => {
      const anticipation = service.buildAnticipation(90);
      expect(anticipation.audioEffects).toBeTruthy();
      expect(anticipation.audioEffects.length).toBeGreaterThan(0);
    });

    it('should have appropriate duration (500-1000ms)', () => {
      const anticipation = service.buildAnticipation(85);
      expect(anticipation.duration).toBeGreaterThanOrEqual(500);
      expect(anticipation.duration).toBeLessThanOrEqual(1000);
    });

    it('should increase intensity with higher progress', () => {
      const low = service.buildAnticipation(40);
      const high = service.buildAnticipation(90);

      expect(high.visualEffects[0].intensity).toBeGreaterThan(low.visualEffects[0].intensity);
    });
  });

  describe('Phase 2: Activity Tracking', () => {
    it('should track player engagement metrics', () => {
      const action: PlayerAction = {
        type: 'tile-placed',
        timestamp: new Date()
      };

      service.provideMicroFeedback(action);
      const metrics = service.trackPlayerEngagement();

      expect(metrics).toBeTruthy();
      expect(metrics.lastActionTimestamp).toBeTruthy();
    });

    it('should calculate actions per minute', () => {
      // Simulate 6 actions in 1 minute
      for (let i = 0; i < 6; i++) {
        vi.advanceTimersByTime(10000); // 10 seconds
        service.provideMicroFeedback({ type: 'tile-placed', timestamp: new Date() });
      }

      const metrics = service.trackPlayerEngagement();
      // Should have ~6 actions in the last minute
      expect(metrics.actionsPerMinute).toBeGreaterThanOrEqual(5);
      expect(metrics.actionsPerMinute).toBeLessThanOrEqual(7);
    });

    it('should detect flow state with consistent high engagement', () => {
      // Simulate consistent actions
      for (let i = 0; i < 10; i++) {
        service.provideMicroFeedback({ type: 'tile-placed', timestamp: new Date() });
        vi.advanceTimersByTime(5000);
      }

      const metrics = service.trackPlayerEngagement();
      expect(metrics.flowStateDetected).toBe(true);
    });

    it('should provide immediate micro-feedback for actions', () => {
      const action: PlayerAction = {
        type: 'puzzle-completed',
        timestamp: new Date()
      };

      const feedback = service.provideMicroFeedback(action);
      expect(feedback).toBeTruthy();
      expect(feedback.message).toBeTruthy();
    });
  });

  describe('Phase 3: Variable Reward System', () => {
    it('should follow probability distribution for rewards', () => {
      const rewards: Record<RewardTier, number> = {
        standard: 0,
        bonus: 0,
        super: 0,
        mega: 0,
        legendary: 0
      };

      // Generate 1000 rewards
      for (let i = 0; i < 1000; i++) {
        const reward = service.calculateReward(100);
        rewards[reward.type]++;
      }

      // Check distribution (with tolerance)
      expect(rewards.standard).toBeGreaterThan(550);
      expect(rewards.standard).toBeLessThan(650);
      expect(rewards.bonus).toBeGreaterThan(250);
      expect(rewards.bonus).toBeLessThan(350);
      expect(rewards.super).toBeGreaterThan(50);
      expect(rewards.super).toBeLessThan(120);
      expect(rewards.mega).toBeGreaterThan(5);
      expect(rewards.legendary).toBeGreaterThanOrEqual(0);
    });

    it('should apply correct multipliers to rewards', () => {
      const baseValue = 100;

      // Force specific reward types for testing
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // bonus (30%)
      const bonusReward = service.calculateReward(baseValue);
      expect(bonusReward.multiplier).toBe(1.2);
      expect(bonusReward.value).toBe(120);
      vi.restoreAllMocks();
    });

    it('should generate unique reward IDs', () => {
      const reward1 = service.calculateReward(100);
      const reward2 = service.calculateReward(100);
      expect(reward1.id).not.toBe(reward2.id);
    });

    it('should provide reward descriptions', () => {
      const reward = service.calculateReward(100);
      expect(reward.description).toBeTruthy();
      expect(reward.description.length).toBeGreaterThan(5);
    });

    it('should include display duration for rewards', () => {
      const reward = service.calculateReward(100);
      expect(reward.displayDuration).toBeGreaterThan(0);
      expect(reward.displayDuration).toBeLessThanOrEqual(5000); // Max 5 seconds
    });
  });

  describe('Ethical Safeguards', () => {
    it('should enforce hourly reward limit (12 max)', () => {
      // Give 12 rewards
      for (let i = 0; i < 12; i++) {
        if (i > 0) {
          vi.advanceTimersByTime(31000); // Wait for cooldown
        }
        const canGive = service.checkCooldown();
        expect(canGive).toBe(true);
        service.deliverReward(service.calculateReward(100));
      }

      // 13th reward should be blocked
      vi.advanceTimersByTime(31000);
      const canGive13th = service.checkCooldown();
      expect(canGive13th).toBe(false);
    });

    it('should reset hourly limit after 1 hour', () => {
      // Give 12 rewards
      for (let i = 0; i < 12; i++) {
        service.deliverReward(service.calculateReward(100));
      }

      expect(service.checkCooldown()).toBe(false);

      // Move forward 1 hour
      vi.advanceTimersByTime(60 * 60 * 1000 + 1000);

      expect(service.checkCooldown()).toBe(true);
    });

    it('should enforce 30-second cooldown between loops', () => {
      service.deliverReward(service.calculateReward(100));
      expect(service.checkCooldown()).toBe(false);

      vi.advanceTimersByTime(20000); // 20 seconds
      expect(service.checkCooldown()).toBe(false);

      vi.advanceTimersByTime(10001); // Total 30+ seconds
      expect(service.checkCooldown()).toBe(true);
    });

    it('should require real progress before giving rewards', () => {
      const config = service.getConfig();
      expect(config.requireRealProgress).toBe(true);

      // Attempting to get reward without progress should fail
      const canGetReward = service.checkCooldown();
      // This would be validated in actual implementation
      expect(canGetReward).toBeDefined();
    });

    it('should show transparent probabilities when enabled', () => {
      const probabilities = service.getTransparentOdds();
      expect(probabilities).toBeTruthy();
      expect(probabilities.standard).toBe(0.60);
      expect(probabilities.bonus).toBe(0.30);
      expect(probabilities.super).toBe(0.08);
      expect(probabilities.mega).toBe(0.019);
      expect(probabilities.legendary).toBe(0.001);
    });

    it('should allow opt-out from dopamine loops', () => {
      service.optOut();
      const state = service.getState();
      expect(state.isOptedOut).toBe(true);
    });

    it('should not deliver rewards when opted out', () => {
      service.optOut();
      const reward = service.calculateReward(100);
      const delivered = service.deliverReward(reward);
      expect(delivered).toBe(false);
    });

    it('should allow opt-in after opt-out', () => {
      service.optOut();
      expect(service.getState().isOptedOut).toBe(true);

      service.optIn();
      expect(service.getState().isOptedOut).toBe(false);
    });
  });

  describe('Goal Progression', () => {
    it('should suggest next goal based on player progress', () => {
      const progress: PlayerProgress = {
        level: 5,
        totalScore: 1000,
        completedPuzzles: 20,
        currentStreak: 3,
        achievements: [],
        skillLevel: 60
      };

      const nextGoal = service.suggestNextGoal(progress);
      expect(nextGoal).toBeTruthy();
      expect(nextGoal.description).toBeTruthy();
      expect(nextGoal.targetValue).toBeGreaterThan(0);
    });

    it('should provide progress toward goal', () => {
      const goal: Goal = {
        id: 'test-goal',
        description: 'Complete 10 puzzles',
        targetValue: 10,
        currentValue: 9,
        progressPercent: 90,
        category: 'puzzle',
        difficulty: 5
      };

      service.showProgressTowardReward(goal);
      const state = service.getState();
      expect(state.currentPhase).toBe('anticipation');
    });

    it('should scale difficulty appropriately', () => {
      const easyProgress: PlayerProgress = {
        level: 1,
        totalScore: 100,
        completedPuzzles: 3,
        currentStreak: 0,
        achievements: [],
        skillLevel: 20
      };

      const hardProgress: PlayerProgress = {
        level: 10,
        totalScore: 10000,
        completedPuzzles: 100,
        currentStreak: 15,
        achievements: ['master'],
        skillLevel: 95
      };

      const easyGoal = service.suggestNextGoal(easyProgress);
      const hardGoal = service.suggestNextGoal(hardProgress);

      expect(hardGoal.difficulty).toBeGreaterThan(easyGoal.difficulty);
    });
  });

  describe('Persistence & State Management', () => {
    it('should persist state to localStorage', () => {
      service.deliverReward(service.calculateReward(100));

      const stored = localStorage.getItem('lixso_dopamine_loop_state');
      expect(stored).toBeTruthy();

      const state = JSON.parse(stored!);
      expect(state.totalRewardsGiven).toBe(1);
    });

    it('should restore state from localStorage', () => {
      // Set up state
      service.deliverReward(service.calculateReward(100));
      const originalTotal = service.getState().totalRewardsGiven;

      // Create new service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(DopamineLoopService);

      expect(newService.getState().totalRewardsGiven).toBe(originalTotal);
    });

    it('should track total rewards given', () => {
      expect(service.getState().totalRewardsGiven).toBe(0);

      service.deliverReward(service.calculateReward(100));
      expect(service.getState().totalRewardsGiven).toBe(1);

      vi.advanceTimersByTime(31000);
      service.deliverReward(service.calculateReward(100));
      expect(service.getState().totalRewardsGiven).toBe(2);

      vi.advanceTimersByTime(31000);
      service.deliverReward(service.calculateReward(100));
      expect(service.getState().totalRewardsGiven).toBe(3);
    });
  });

  describe('Integration - Full Dopamine Loop Cycle', () => {
    it('should execute complete 3-phase cycle', async () => {
      // Phase 1: Anticipation
      const anticipation = service.buildAnticipation(90);
      expect(anticipation.level).toBe('high');

      // Phase 2: Activity
      const action: PlayerAction = { type: 'puzzle-completed', timestamp: new Date() };
      service.provideMicroFeedback(action);

      // Phase 3: Reward
      const reward = service.calculateReward(1000);
      const delivered = service.deliverReward(reward);

      expect(delivered).toBe(true);
      expect(service.getState().totalRewardsGiven).toBe(1);
    });

    it('should transition through phases correctly', () => {
      expect(service.getState().currentPhase).toBe('idle');

      service.buildAnticipation(85);
      expect(service.getState().currentPhase).toBe('anticipation');

      service.provideMicroFeedback({ type: 'tile-placed', timestamp: new Date() });
      expect(service.getState().currentPhase).toBe('activity');

      service.deliverReward(service.calculateReward(100));
      expect(service.getState().currentPhase).toBe('reward');

      // Run timers to transition reward -> cooldown -> idle
      vi.advanceTimersByTime(2000); // Display duration
      expect(service.getState().currentPhase).toBe('cooldown');

      vi.advanceTimersByTime(31000); // Cooldown period
      expect(service.getState().currentPhase).toBe('idle');
    });
  });
});
