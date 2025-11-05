import { Injectable, signal, effect } from '@angular/core';

/**
 * Theme Service
 * Manages application themes including dark mode, high contrast,
 * and colorblind-friendly modes
 */

export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'auto';
export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'monochrome';

export interface ThemeSettings {
  mode: ThemeMode;
  colorblindMode: ColorblindMode;
  fontSize: number; // percentage: 80-150
  reduceMotion: boolean;
  customAccentColor?: string;
}

const DEFAULT_THEME: ThemeSettings = {
  mode: 'auto',
  colorblindMode: 'none',
  fontSize: 100,
  reduceMotion: false
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'lixso-theme-settings';

  // Signal-based reactive state
  public theme = signal<ThemeSettings>(this.loadTheme());

  // Computed theme based on auto detection
  public activeTheme = signal<'light' | 'dark' | 'high-contrast'>('light');

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.theme());

    // React to theme changes
    effect(() => {
      const settings = this.theme();
      this.applyTheme(settings);
      this.saveTheme(settings);
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme().mode === 'auto') {
          this.applyTheme(this.theme());
        }
      });

      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
        this.updateSettings({ reduceMotion: e.matches });
      });
    }
  }

  /**
   * Update theme settings
   */
  public updateSettings(partial: Partial<ThemeSettings>): void {
    this.theme.update(current => ({ ...current, ...partial }));
  }

  /**
   * Set theme mode
   */
  public setMode(mode: ThemeMode): void {
    this.updateSettings({ mode });
  }

  /**
   * Set colorblind mode
   */
  public setColorblindMode(mode: ColorblindMode): void {
    this.updateSettings({ colorblindMode: mode });
  }

  /**
   * Adjust font size
   */
  public setFontSize(size: number): void {
    const clampedSize = Math.max(80, Math.min(150, size));
    this.updateSettings({ fontSize: clampedSize });
  }

  /**
   * Toggle reduced motion
   */
  public toggleReducedMotion(): void {
    this.updateSettings({ reduceMotion: !this.theme().reduceMotion });
  }

  /**
   * Reset to defaults
   */
  public resetToDefaults(): void {
    this.theme.set(DEFAULT_THEME);
  }

  /**
   * Apply theme to document
   */
  private applyTheme(settings: ThemeSettings): void {
    const root = document.documentElement;

    // Determine active theme
    let activeMode: 'light' | 'dark' | 'high-contrast' = 'light';

    if (settings.mode === 'auto') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      activeMode = prefersDark ? 'dark' : 'light';
    } else if (settings.mode === 'high-contrast') {
      activeMode = 'high-contrast';
    } else {
      activeMode = settings.mode;
    }

    this.activeTheme.set(activeMode);

    // Remove all theme classes
    root.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    root.classList.remove('cb-protanopia', 'cb-deuteranopia', 'cb-tritanopia', 'cb-monochrome');

    // Add active theme class
    root.classList.add(`theme-${activeMode}`);

    // Add colorblind mode class
    if (settings.colorblindMode !== 'none') {
      root.classList.add(`cb-${settings.colorblindMode}`);
    }

    // Apply font size
    root.style.fontSize = `${settings.fontSize}%`;

    // Apply motion preference
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Apply custom accent color
    if (settings.customAccentColor) {
      root.style.setProperty('--accent-color', settings.customAccentColor);
    }
  }

  /**
   * Load theme from localStorage
   */
  private loadTheme(): ThemeSettings {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_THEME, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }

    // Check system preferences
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    return {
      ...DEFAULT_THEME,
      mode: prefersDark ? 'dark' : 'light',
      reduceMotion: prefersReducedMotion
    };
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(settings: ThemeSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  }

  /**
   * Get color palette for current theme
   */
  public getColorPalette(): ColorPalette {
    const theme = this.activeTheme();
    const colorblind = this.theme().colorblindMode;

    return this.getThemeColors(theme, colorblind);
  }

  /**
   * Get theme-specific colors
   */
  private getThemeColors(theme: string, colorblindMode: ColorblindMode): ColorPalette {
    const palettes: Record<string, ColorPalette> = {
      light: {
        background: '#ffffff',
        surface: '#f5f7fa',
        primary: '#667eea',
        secondary: '#764ba2',
        text: '#2c3e50',
        textSecondary: '#7f8c8d',
        border: '#e1e8ed',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db',

        // Tile colors (adjusted for colorblind modes)
        tileI: this.adjustForColorblind('#3498db', colorblindMode), // Blue
        tileX: this.adjustForColorblind('#e74c3c', colorblindMode), // Red
        tileS: this.adjustForColorblind('#f39c12', colorblindMode), // Orange
        tileO: this.adjustForColorblind('#27ae60', colorblindMode), // Green
      },
      dark: {
        background: '#1a1a2e',
        surface: '#16213e',
        primary: '#667eea',
        secondary: '#764ba2',
        text: '#e9ecef',
        textSecondary: '#adb5bd',
        border: '#2c3e50',
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db',

        tileI: this.adjustForColorblind('#5dade2', colorblindMode),
        tileX: this.adjustForColorblind('#ec7063', colorblindMode),
        tileS: this.adjustForColorblind('#f5b041', colorblindMode),
        tileO: this.adjustForColorblind('#58d68d', colorblindMode),
      },
      'high-contrast': {
        background: '#000000',
        surface: '#1a1a1a',
        primary: '#ffff00',
        secondary: '#00ffff',
        text: '#ffffff',
        textSecondary: '#cccccc',
        border: '#ffffff',
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#00ffff',

        tileI: '#00ffff',
        tileX: '#ff00ff',
        tileS: '#ffff00',
        tileO: '#00ff00',
      }
    };

    return palettes[theme] || palettes['light'];
  }

  /**
   * Adjust colors for colorblind modes
   */
  private adjustForColorblind(color: string, mode: ColorblindMode): string {
    if (mode === 'none') return color;

    // Simplified colorblind-friendly palette adjustments
    const colorblindPalettes: Record<string, Record<string, string>> = {
      protanopia: { // Red-blind
        '#3498db': '#0077bb', // Blue - stronger
        '#e74c3c': '#882255', // Red → Purple
        '#f39c12': '#ddaa33', // Orange
        '#27ae60': '#44aa99', // Green → Teal
      },
      deuteranopia: { // Green-blind
        '#3498db': '#0077bb', // Blue
        '#e74c3c': '#cc3311', // Red
        '#f39c12': '#ee8866', // Orange
        '#27ae60': '#0077bb', // Green → Blue
      },
      tritanopia: { // Blue-blind
        '#3498db': '#ee3377', // Blue → Magenta
        '#e74c3c': '#cc3311', // Red
        '#f39c12': '#ddaa33', // Orange
        '#27ae60': '#009988', // Green
      },
      monochrome: {
        '#3498db': '#666666',
        '#e74c3c': '#333333',
        '#f39c12': '#999999',
        '#27ae60': '#cccccc',
      }
    };

    return colorblindPalettes[mode]?.[color] || color;
  }
}

export interface ColorPalette {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  tileI: string;
  tileX: string;
  tileS: string;
  tileO: string;
}
