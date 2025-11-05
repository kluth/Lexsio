import { Injectable, signal } from '@angular/core';
import {
  AIHint,
  HintLevel,
  HintType,
  BoardAnalysis,
  AIHintConfig,
  HintStatistics,
  ChromeAICapabilities,
  ChromeAIHintRequest,
  ChromeAIHintResponse,
  HeuristicHint,
  PlayerContext,
  HintCacheEntry
} from '../models/ai-hint.models';
import { GridCell, LTile, CellSymbol } from '../models/game.models';

/**
 * AI-Powered Hint Service
 *
 * Uses Chrome's Built-in AI (Gemini Nano) via window.ai API
 * Provides intelligent, natural language hints with zero API costs
 */

// Extend Window interface for Chrome Built-in AI (Gemini Nano)
// Based on Chrome 138+ API: developer.chrome.com/docs/ai/built-in-apis
declare global {
  interface Window {
    ai?: {
      languageModel: {
        capabilities(): Promise<AILanguageModelCapabilities>;
        create(options?: AILanguageModelCreateOptions): Promise<AILanguageModel>;
      };
      // Future APIs
      summarizer?: any;
      translator?: any;
      writer?: any;
      rewriter?: any;
    };
  }

  interface AILanguageModelCapabilities {
    available: 'readily' | 'after-download' | 'no';
    defaultTopK?: number;
    maxTopK?: number;
    defaultTemperature?: number;
  }

  interface AILanguageModelCreateOptions {
    systemPrompt?: string;
    temperature?: number;
    topK?: number;
    signal?: AbortSignal;
  }

  interface AILanguageModel {
    prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
    promptStreaming(input: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
    countPromptTokens(input: string): Promise<number>;
    tokensLeft: number;
    tokensSoFar: number;
    maxTokens: number;
    destroy(): void;
    clone(): Promise<AILanguageModel>;
  }
}

const DEFAULT_CONFIG: AIHintConfig = {
  useChromeAI: true,
  temperature: 0.7,
  maxOutputLength: 500,
  enableCache: true,
  cacheTimeout: 300000, // 5 minutes
  enableHeuristics: true,
  fallbackOnError: true,
  timeout: 5000
};

@Injectable({
  providedIn: 'root'
})
export class AIHintService {
  private config = signal<AIHintConfig>(DEFAULT_CONFIG);
  private capabilities = signal<ChromeAICapabilities>({
    available: false,
    promptAPI: false,
    translationAPI: false,
    summarizationAPI: false,
    languageDetectionAPI: false
  });
  private statistics = signal<HintStatistics>({
    totalHints: 0,
    chromeAIHints: 0,
    heuristicHints: 0,
    averageConfidence: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    chromeAIAvailability: 0
  });

  private cache = new Map<string, HintCacheEntry>();
  private session: AILanguageModel | null = null;

  constructor() {
    this.detectChromeAI();
  }

  /**
   * Detect if Chrome AI is available
   */
  private async detectChromeAI(): Promise<void> {
    try {
      if ('ai' in window && window.ai?.languageModel) {
        const caps = await window.ai.languageModel.capabilities();

        this.capabilities.update(current => ({
          ...current,
          available: caps.available !== 'no',
          promptAPI: caps.available !== 'no'
        }));

        console.log('[AI Hint] Chrome AI Status:', caps.available);

        if (caps.available === 'after-download') {
          console.log('[AI Hint] Gemini Nano requires download. Will fallback to heuristics.');
        } else if (caps.available === 'readily') {
          console.log('[AI Hint] Gemini Nano is ready! 🚀');
        }
      } else {
        console.warn('[AI Hint] Chrome AI not available. Using heuristics only.');
        console.warn('[AI Hint] Note: Chrome AI requires Chrome 138+ and specific flags enabled.');
        this.capabilities.update(caps => ({ ...caps, available: false }));
      }
    } catch (error) {
      console.error('[AI Hint] Error detecting Chrome AI:', error);
      this.capabilities.update(caps => ({ ...caps, available: false }));
    }
  }

  /**
   * Initialize Chrome AI session (Gemini Nano)
   */
  private async initializeSession(): Promise<AILanguageModel | null> {
    try {
      if (!window.ai?.languageModel || !this.capabilities().promptAPI) {
        return null;
      }

      const caps = await window.ai.languageModel.capabilities();
      if (caps.available === 'no') {
        return null;
      }

      // Create session with system prompt
      const systemPrompt = `You are an AI puzzle coach for Lixso, a logic puzzle game.
Your role is to provide helpful, encouraging hints that teach players strategy without giving away solutions.
Always respond in a friendly, educational tone.`;

      this.session = await window.ai.languageModel.create({
        systemPrompt,
        temperature: this.config().temperature,
        topK: caps.defaultTopK || 3
      });

      console.log('[AI Hint] Gemini Nano session initialized successfully! 🎉');
      console.log(`[AI Hint] Max tokens: ${this.session.maxTokens}, Tokens left: ${this.session.tokensLeft}`);

      return this.session;
    } catch (error) {
      console.error('[AI Hint] Error initializing Gemini Nano session:', error);
      return null;
    }
  }

  /**
   * Generate AI-powered hint
   */
  public async generateHint(
    grid: GridCell[][],
    level: HintLevel = 'intermediate',
    type: HintType = 'next-move',
    playerContext?: Partial<PlayerContext>
  ): Promise<AIHint> {
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(grid, level, type);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('[AI Hint] Cache hit!');
        return cached;
      }

      // Analyze board
      const analysis = this.analyzeBoard(grid);

      // Try Chrome AI first
      if (this.config().useChromeAI && this.capabilities().promptAPI) {
        try {
          const hint = await this.generateChromeAIHint(grid, analysis, level, type, playerContext);
          this.updateStatistics(startTime, 'chrome-ai');
          this.addToCache(cacheKey, hint);
          return hint;
        } catch (error) {
          console.warn('[AI Hint] Chrome AI failed, falling back to heuristics:', error);
          if (!this.config().fallbackOnError) {
            throw error;
          }
        }
      }

      // Fallback to heuristics
      const hint = await this.generateHeuristicHint(grid, analysis, level, type);
      this.updateStatistics(startTime, 'heuristic');
      this.addToCache(cacheKey, hint);
      return hint;

    } catch (error) {
      console.error('[AI Hint] Error generating hint:', error);
      throw new Error('Failed to generate hint');
    }
  }

  /**
   * Generate hint using Chrome AI (Gemini Nano)
   */
  private async generateChromeAIHint(
    grid: GridCell[][],
    analysis: BoardAnalysis,
    level: HintLevel,
    type: HintType,
    playerContext?: Partial<PlayerContext>
  ): Promise<AIHint> {
    // Initialize session if needed
    if (!this.session) {
      this.session = await this.initializeSession();
      if (!this.session) {
        throw new Error('Chrome AI session unavailable');
      }
    }

    // Create prompt for Chrome AI
    const prompt = this.createPrompt(grid, analysis, level, type, playerContext);

    try {
      // Get AI response
      const responseText = await this.session.prompt(prompt);

      // Parse response
      const parsed = this.parseAIResponse(responseText);

      // Create hint
      const hint: AIHint = {
        id: this.generateHintId(),
        type,
        level,
        title: parsed.hint,
        explanation: parsed.reasoning,
        suggestedTile: parsed.suggestedMove ? this.createTileFromMove(parsed.suggestedMove) : undefined,
        suggestedPosition: parsed.suggestedMove ? {
          row: parsed.suggestedMove.row,
          col: parsed.suggestedMove.col
        } : undefined,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        moveQuality: this.calculateMoveQuality(parsed),
        difficultyReduction: 25,
        source: 'chrome-ai',
        generatedAt: new Date(),
        processingTime: 0
      };

      return hint;
    } catch (error) {
      console.error('[AI Hint] Chrome AI prompt failed:', error);
      throw error;
    }
  }

  /**
   * Create prompt for Chrome AI
   */
  private createPrompt(
    grid: GridCell[][],
    analysis: BoardAnalysis,
    level: HintLevel,
    type: HintType,
    playerContext?: Partial<PlayerContext>
  ): string {
    const boardState = this.serializeBoard(grid);
    const levelInstructions = this.getLevelInstructions(level);

    return `You are an AI puzzle coach for a logic puzzle game called Lixso.

GAME RULES:
- Grid is filled with L-shaped tiles (3 cells each)
- Each tile has one of 4 symbols: I, X, S, O
- Same symbols cannot be adjacent (horizontally, vertically, or diagonally)
- Some cells are pre-filled and cannot be changed

CURRENT BOARD STATE:
${boardState}

ANALYSIS:
- Empty cells: ${analysis.emptyCount}
- Filled cells: ${analysis.filledCount}
- Complexity: ${analysis.complexity}/100

PLAYER LEVEL: ${level}
${levelInstructions}

TASK: Provide a ${type} hint for the player.

Respond in this JSON format:
{
  "hint": "Brief, encouraging hint (1 sentence)",
  "reasoning": "Clear explanation of why this move is good",
  "suggestedMove": {
    "symbol": "I" | "X" | "S" | "O",
    "orientation": 0-3,
    "row": number,
    "col": number
  },
  "confidence": 0-1
}`;
  }

  /**
   * Get level-specific instructions
   */
  private getLevelInstructions(level: HintLevel): string {
    const instructions: Record<HintLevel, string> = {
      beginner: 'Give very detailed, step-by-step explanations. Focus on teaching the basics.',
      intermediate: 'Provide clear explanations with some strategy insights.',
      advanced: 'Give strategic hints that encourage critical thinking.',
      expert: 'Provide subtle hints that guide without giving away the solution.'
    };
    return instructions[level];
  }

  /**
   * Serialize board for AI
   */
  private serializeBoard(grid: GridCell[][]): string {
    let result = '';
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        const cell = grid[row][col];
        result += cell.symbol || '.';
        result += ' ';
      }
      result += '\n';
    }
    return result;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(response: string): ChromeAIHintResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          hint: parsed.hint || 'Consider your next move carefully',
          reasoning: parsed.reasoning || 'Analyze the board patterns',
          suggestedMove: parsed.suggestedMove,
          confidence: parsed.confidence || 0.7
        };
      }

      // Fallback: use response as hint
      return {
        hint: response.substring(0, 100),
        reasoning: response,
        confidence: 0.5
      };
    } catch (error) {
      console.warn('[AI Hint] Failed to parse AI response, using fallback');
      return {
        hint: 'Look for empty spaces where tiles can fit',
        reasoning: response,
        confidence: 0.5
      };
    }
  }

  /**
   * Generate heuristic hint (fallback)
   */
  private async generateHeuristicHint(
    grid: GridCell[][],
    analysis: BoardAnalysis,
    level: HintLevel,
    type: HintType
  ): Promise<AIHint> {
    // Simple heuristic: find first valid tile placement
    const suggestion = this.findBestMove(grid, analysis);

    const hint: AIHint = {
      id: this.generateHintId(),
      type,
      level,
      title: this.getHeuristicTitle(suggestion, level),
      explanation: this.getHeuristicExplanation(suggestion, level),
      suggestedTile: suggestion.tile,
      suggestedPosition: suggestion.position,
      confidence: 0.8,
      moveQuality: 75,
      difficultyReduction: 20,
      source: 'heuristic',
      generatedAt: new Date(),
      processingTime: 10
    };

    return hint;
  }

  /**
   * Find best move using heuristics
   */
  private findBestMove(grid: GridCell[][], analysis: BoardAnalysis): {
    tile: LTile;
    position: { row: number; col: number };
  } {
    // Simple heuristic: find first valid placement
    const symbols: CellSymbol[] = ['I', 'X', 'S', 'O'];

    for (let row = 0; row < grid.length - 2; row++) {
      for (let col = 0; col < grid[row].length - 2; col++) {
        for (const symbol of symbols) {
          for (let orientation = 0; orientation < 4; orientation++) {
            const tile: LTile = {
              symbol,
              orientation,
              row,
              col
            };

            if (this.isValidPlacement(grid, tile)) {
              return { tile, position: { row, col } };
            }
          }
        }
      }
    }

    // Fallback
    return {
      tile: { symbol: 'I', orientation: 0, row: 0, col: 0 },
      position: { row: 0, col: 0 }
    };
  }

  /**
   * Check if tile placement is valid
   */
  private isValidPlacement(grid: GridCell[][], tile: LTile): boolean {
    // This is a simplified check - you should integrate with the game service
    // for full validation logic
    return true; // Placeholder
  }

  /**
   * Analyze board state
   */
  private analyzeBoard(grid: GridCell[][]): BoardAnalysis {
    let emptyCount = 0;
    let filledCount = 0;
    let prefillCount = 0;

    for (const row of grid) {
      for (const cell of row) {
        if (!cell.symbol) {
          emptyCount++;
        } else {
          filledCount++;
          if (cell.isPrefilled) prefillCount++;
        }
      }
    }

    const totalCells = grid.length * grid[0].length;
    const complexity = Math.round((filledCount / totalCells) * 100);

    return {
      currentState: grid,
      emptyCount,
      filledCount,
      prefillCount,
      clusters: [],
      openSpaces: [],
      constraints: [],
      complexity,
      estimatedMoves: Math.ceil(emptyCount / 3),
      solutionCount: 1,
      errorCount: 0,
      hintsUsed: 0,
      timeElapsed: 0
    };
  }

  /**
   * Helper methods
   */
  private generateHintId(): string {
    return `hint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCacheKey(grid: GridCell[][], level: HintLevel, type: HintType): string {
    const boardHash = JSON.stringify(grid);
    return `${boardHash}-${level}-${type}`;
  }

  private getFromCache(key: string): AIHint | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.cachedAt.getTime();
    if (age > this.config().cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.hint;
  }

  private addToCache(key: string, hint: AIHint): void {
    if (!this.config().enableCache) return;

    this.cache.set(key, {
      boardHash: key,
      hint,
      cachedAt: new Date(),
      hits: 0
    });

    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  private updateStatistics(startTime: number, source: 'chrome-ai' | 'heuristic'): void {
    const responseTime = Date.now() - startTime;

    this.statistics.update(stats => ({
      ...stats,
      totalHints: stats.totalHints + 1,
      chromeAIHints: source === 'chrome-ai' ? stats.chromeAIHints + 1 : stats.chromeAIHints,
      heuristicHints: source === 'heuristic' ? stats.heuristicHints + 1 : stats.heuristicHints,
      averageResponseTime: (stats.averageResponseTime * stats.totalHints + responseTime) / (stats.totalHints + 1)
    }));
  }

  private calculateMoveQuality(response: ChromeAIHintResponse): number {
    return Math.round(response.confidence * 100);
  }

  private createTileFromMove(move: { symbol: CellSymbol; orientation: number; row: number; col: number }): LTile {
    return {
      symbol: move.symbol,
      orientation: move.orientation,
      row: move.row,
      col: move.col
    };
  }

  private getHeuristicTitle(suggestion: { tile: LTile; position: { row: number; col: number } }, level: HintLevel): string {
    return `Try placing a ${suggestion.tile.symbol} tile`;
  }

  private getHeuristicExplanation(suggestion: { tile: LTile; position: { row: number; col: number } }, level: HintLevel): string {
    return `Consider placing a ${suggestion.tile.symbol} tile at row ${suggestion.position.row + 1}, column ${suggestion.position.col + 1}. This move opens up future possibilities.`;
  }

  /**
   * Public API
   */
  public getCapabilities(): ChromeAICapabilities {
    return this.capabilities();
  }

  public getStatistics(): HintStatistics {
    return this.statistics();
  }

  public updateConfig(partial: Partial<AIHintConfig>): void {
    this.config.update(current => ({ ...current, ...partial }));
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public async destroy(): Promise<void> {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }
}
