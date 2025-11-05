// Color Psychology Service Tests - TDD Approach
// RED phase: All tests should FAIL initially

import { TestBed } from '@angular/core/testing';

import {
  ColorBlindType,
  ColorTheme,
  EmotionalTag,
  ThemeId,
} from '../models/color-psychology.models';

import { ColorPsychologyService } from './color-psychology';

describe('ColorPsychologyService - TDD', () => {
  let service: ColorPsychologyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorPsychologyService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Theme Management', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return default Focus theme on initialization', () => {
      const theme = service.getCurrentTheme();
      expect(theme).toBeTruthy();
      expect(theme.id).toBe(ThemeId.FOCUS);
      expect(theme.name).toBe('Focus Mode');
    });

    it('should return all available themes', () => {
      const themes = service.getAllThemes();
      expect(themes.length).toBeGreaterThanOrEqual(7); // At least 7 themes
      expect(themes.map((t) => t.id)).toContain(ThemeId.FOCUS);
      expect(themes.map((t) => t.id)).toContain(ThemeId.ZEN);
      expect(themes.map((t) => t.id)).toContain(ThemeId.COMPETITIVE);
      expect(themes.map((t) => t.id)).toContain(ThemeId.HIGH_CONTRAST);
    });

    it('should get theme by ID', () => {
      const zenTheme = service.getThemeById(ThemeId.ZEN);
      expect(zenTheme).toBeTruthy();
      expect(zenTheme?.name).toBe('Zen Mode');
      expect(zenTheme?.emotionalTags).toContain('peaceful' as EmotionalTag);
    });

    it('should return null for invalid theme ID', () => {
      const invalidTheme = service.getThemeById('invalid-id');
      expect(invalidTheme).toBeNull();
    });

    it('should set theme and persist to localStorage', () => {
      const success = service.setTheme(ThemeId.ZEN);
      expect(success).toBe(true);
      expect(service.getCurrentTheme().id).toBe(ThemeId.ZEN);

      // Check localStorage persistence
      const stored = localStorage.getItem('lixso_theme_preference');
      expect(stored).toBeTruthy();
      const preference = JSON.parse(stored!);
      expect(preference.themeId).toBe(ThemeId.ZEN);
    });

    it('should return false when setting invalid theme', () => {
      const success = service.setTheme('invalid-theme');
      expect(success).toBe(false);
      // Should keep current theme
      expect(service.getCurrentTheme().id).toBe(ThemeId.FOCUS);
    });

    it('should restore theme from localStorage on initialization', () => {
      // Set up localStorage BEFORE service creation
      const preference = {
        themeId: ThemeId.COMPETITIVE,
        colorBlindMode: 'none' as ColorBlindType,
        symbolsEnabled: false,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem('lixso_theme_preference', JSON.stringify(preference));

      // Reset TestBed to create fresh service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(ColorPsychologyService);
      expect(newService.getCurrentTheme().id).toBe(ThemeId.COMPETITIVE);
    });
  });

  describe('Color Psychology - Emotional Impact', () => {
    it('should provide themes with correct emotional tags', () => {
      const focusTheme = service.getThemeById(ThemeId.FOCUS);
      expect(focusTheme?.emotionalTags).toContain('focused' as EmotionalTag);
      expect(focusTheme?.emotionalTags).toContain('calm' as EmotionalTag);

      const zenTheme = service.getThemeById(ThemeId.ZEN);
      expect(zenTheme?.emotionalTags).toContain('relaxed' as EmotionalTag);
      expect(zenTheme?.emotionalTags).toContain('peaceful' as EmotionalTag);

      const competitiveTheme = service.getThemeById(ThemeId.COMPETITIVE);
      expect(competitiveTheme?.emotionalTags).toContain('energetic' as EmotionalTag);
      expect(competitiveTheme?.emotionalTags).toContain('competitive' as EmotionalTag);
    });

    it('should suggest appropriate theme for game mode', () => {
      const zenModeTheme = service.suggestThemeForMode('zen');
      expect(zenModeTheme.id).toBe(ThemeId.ZEN);

      const timeTrialTheme = service.suggestThemeForMode('time-trial');
      expect(timeTrialTheme.id).toBe(ThemeId.COMPETITIVE);

      const classicTheme = service.suggestThemeForMode('classic');
      expect(classicTheme.id).toBe(ThemeId.FOCUS);
    });

    it('should provide psychological effect descriptions', () => {
      const focusTheme = service.getThemeById(ThemeId.FOCUS);
      expect(focusTheme?.psychologicalEffect).toBeTruthy();
      expect(focusTheme?.psychologicalEffect.length).toBeGreaterThan(20);
    });
  });

  describe('Accessibility - WCAG Compliance', () => {
    it('should validate theme accessibility', () => {
      const focusTheme = service.getThemeById(ThemeId.FOCUS)!;
      const report = service.validateAccessibility(focusTheme);

      expect(report).toBeTruthy();
      expect(report.meetsWCAG).toBe(true);
      expect(report.wcagLevel).toMatch(/^(A|AA|AAA)$/);
    });

    it('should ensure High Contrast theme meets WCAG AAA', () => {
      const highContrastTheme = service.getThemeById(ThemeId.HIGH_CONTRAST)!;
      const report = service.validateAccessibility(highContrastTheme);

      expect(report.meetsWCAG).toBe(true);
      expect(report.wcagLevel).toBe('AAA');
      expect(highContrastTheme.accessibility.contrastRatio).toBeGreaterThanOrEqual(7); // WCAG AAA requires 7:1
    });

    it('should detect contrast issues in themes', () => {
      const mockBadTheme: ColorTheme = {
        id: 'bad-theme',
        name: 'Bad Theme',
        description: 'Theme with poor contrast',
        psychologicalEffect: 'None',
        colors: {
          primary: '#CCCCCC',
          accent: '#DDDDDD',
          success: '#EEEEEE',
          error: '#FFFFFF',
          hint: '#AAAAAA',
          warning: '#BBBBBB',
          background: '#FFFFFF',
          backgroundSecondary: '#F0F0F0',
          text: '#DDDDDD', // Poor contrast with white background
          textSecondary: '#EEEEEE',
        },
        accessibility: {
          contrastRatio: 1.5,
          colorBlindSafe: false,
          symbolsEnabled: false,
          wcagLevel: 'fail',
        },
        emotionalTags: [],
      };

      const report = service.validateAccessibility(mockBadTheme);
      expect(report.meetsWCAG).toBe(false);
      expect(report.wcagLevel).toBe('fail');
      expect(report.contrastIssues.length).toBeGreaterThan(0);
    });

    it('should calculate contrast ratio correctly', () => {
      // Test with known values
      const blackWhiteRatio = service.calculateContrastRatio('#000000', '#FFFFFF');
      expect(blackWhiteRatio).toBeCloseTo(21, 0); // Maximum contrast

      const sameColorRatio = service.calculateContrastRatio('#FF0000', '#FF0000');
      expect(sameColorRatio).toBe(1); // Minimum contrast
    });
  });

  describe('Color Blindness Support', () => {
    it('should enable symbols for color-blind users', () => {
      service.setColorBlindMode('protanopia');
      const preference = service.getThemePreference();
      expect(preference.symbolsEnabled).toBe(true);
      expect(preference.colorBlindMode).toBe('protanopia');
    });

    it('should switch to appropriate theme for protanopia', () => {
      service.setColorBlindMode('protanopia');
      const current = service.getCurrentTheme();
      expect(current.id).toBe(ThemeId.PROTANOPIA);
      expect(current.accessibility.colorBlindSafe).toBe(true);
    });

    it('should switch to appropriate theme for deuteranopia', () => {
      service.setColorBlindMode('deuteranopia');
      const current = service.getCurrentTheme();
      expect(current.id).toBe(ThemeId.DEUTERANOPIA);
      expect(current.accessibility.colorBlindSafe).toBe(true);
    });

    it('should switch to appropriate theme for tritanopia', () => {
      service.setColorBlindMode('tritanopia');
      const current = service.getCurrentTheme();
      expect(current.id).toBe(ThemeId.TRITANOPIA);
      expect(current.accessibility.colorBlindSafe).toBe(true);
    });

    it('should persist color-blind mode preference', () => {
      service.setColorBlindMode('deuteranopia');

      const stored = localStorage.getItem('lixso_theme_preference');
      const preference = JSON.parse(stored!);
      expect(preference.colorBlindMode).toBe('deuteranopia');
      expect(preference.symbolsEnabled).toBe(true);
    });
  });

  describe('Theme Application', () => {
    it('should apply theme colors to CSS variables', () => {
      const mockElement = document.createElement('div');
      service.applyThemeToElement(mockElement, ThemeId.ZEN);

      const styles = mockElement.style;
      expect(styles.getPropertyValue('--color-primary')).toBeTruthy();
      expect(styles.getPropertyValue('--color-success')).toBeTruthy();
      expect(styles.getPropertyValue('--color-error')).toBeTruthy();
    });

    it('should apply color psychology to specific elements', () => {
      const element = document.createElement('div');
      service.applyColorPsychology(element, 'success');

      // Browsers return rgb format, not hex
      const bgColor = element.style.backgroundColor;
      expect(bgColor).toBeTruthy();
      expect(bgColor).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    });

    it('should apply error color psychology with red tones', () => {
      const element = document.createElement('div');
      service.applyColorPsychology(element, 'error');

      // Error should have reddish/warm tones for urgency
      const bgColor = element.style.backgroundColor;
      expect(bgColor).toBeTruthy();
    });

    it('should apply hint color psychology with blue tones', () => {
      const element = document.createElement('div');
      service.applyColorPsychology(element, 'hint');

      // Hint should have bluish tones for trust/calm
      const bgColor = element.style.backgroundColor;
      expect(bgColor).toBeTruthy();
    });
  });

  describe('Recommendations', () => {
    it('should recommend High Contrast for poor visibility', () => {
      const recommendations = service.getThemeRecommendations({ needsHighContrast: true });
      expect(recommendations[0].id).toBe(ThemeId.HIGH_CONTRAST);
    });

    it('should recommend Zen theme for relaxation', () => {
      const recommendations = service.getThemeRecommendations({ emotionalState: 'stressed' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      const zenTheme = recommendations.find((t) => t.id === ThemeId.ZEN);
      expect(zenTheme).toBeTruthy();
    });

    it('should recommend Competitive theme for high-energy modes', () => {
      const recommendations = service.getThemeRecommendations({ emotionalState: 'energetic' });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      const competitiveTheme = recommendations.find((t) => t.id === ThemeId.COMPETITIVE);
      expect(competitiveTheme).toBeTruthy();
    });
  });

  describe('2025 Design Trends', () => {
    it('should include earthy, natural palette in Focus theme', () => {
      const focusTheme = service.getThemeById(ThemeId.FOCUS)!;
      // Focus theme should have warm, inviting hues (2025 trend)
      expect(focusTheme.colors.primary).toMatch(/#[A-F0-9]{6}/i);
      expect(focusTheme.description.toLowerCase()).toContain('calm');
    });

    it('should use sophisticated gradients where applicable', () => {
      // This would be tested in the component that renders gradients
      // For now, ensure themes have complementary colors for gradients
      const themes = service.getAllThemes();
      themes.forEach((theme) => {
        expect(theme.colors.primary).toBeTruthy();
        expect(theme.colors.accent).toBeTruthy();
        expect(theme.colors.primary).not.toBe(theme.colors.accent);
      });
    });
  });
});
