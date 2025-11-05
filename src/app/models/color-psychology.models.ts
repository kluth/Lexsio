// Color Psychology Theme System Models
// Based on research: 85% of first impressions are color-based
// Accessibility: 8% men, 0.5% women have color vision deficiency

export type EmotionalTag =
  | 'calm'
  | 'energetic'
  | 'focused'
  | 'relaxed'
  | 'competitive'
  | 'peaceful';
export type ColorBlindType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface ColorPalette {
  primary: string;
  accent: string;
  success: string;
  error: string;
  hint: string;
  warning: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
}

export interface AccessibilityConfig {
  contrastRatio: number;
  colorBlindSafe: boolean;
  symbolsEnabled: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  psychologicalEffect: string;
  colors: ColorPalette;
  accessibility: AccessibilityConfig;
  emotionalTags: EmotionalTag[];
  recommendedForModes?: string[]; // Game mode IDs
}

export interface AccessibilityReport {
  meetsWCAG: boolean;
  wcagLevel: 'A' | 'AA' | 'AAA' | 'fail';
  contrastIssues: ContrastIssue[];
  recommendations: string[];
}

export interface ContrastIssue {
  foreground: string;
  background: string;
  ratio: number;
  required: number;
  passes: boolean;
}

export interface ThemePreference {
  userId?: string;
  themeId: string;
  colorBlindMode: ColorBlindType;
  symbolsEnabled: boolean;
  lastUpdated: Date;
}

// Predefined theme IDs
export enum ThemeId {
  FOCUS = 'focus',
  ZEN = 'zen',
  COMPETITIVE = 'competitive',
  HIGH_CONTRAST = 'high-contrast',
  PROTANOPIA = 'protanopia',
  DEUTERANOPIA = 'deuteranopia',
  TRITANOPIA = 'tritanopia',
}
