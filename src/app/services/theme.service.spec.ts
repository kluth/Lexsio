/* eslint-disable no-promise-executor-return */
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have theme signal', () => {
      const theme = service.theme();
      expect(theme).toBeDefined();
      expect(theme.mode).toBeTruthy();
    });

    it('should have activeTheme signal', () => {
      const activeTheme = service.activeTheme();
      expect(activeTheme).toBeTruthy();
      expect(['light', 'dark', 'high-contrast']).toContain(activeTheme);
    });
  });

  describe('Theme Mode', () => {
    it('should set light mode', () => {
      service.setMode('light');
      expect(service.theme().mode).toBe('light');
    });

    it('should set dark mode', () => {
      service.setMode('dark');
      expect(service.theme().mode).toBe('dark');
    });

    it('should set high-contrast mode', () => {
      service.setMode('high-contrast');
      expect(service.theme().mode).toBe('high-contrast');
    });

    it('should set auto mode', () => {
      service.setMode('auto');
      expect(service.theme().mode).toBe('auto');
    });

    it('should persist mode to localStorage', async () => {
      service.setMode('dark');

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.mode).toBe('dark');
      }
    });
  });

  describe('Colorblind Mode', () => {
    it('should set protanopia mode', () => {
      service.setColorblindMode('protanopia');
      expect(service.theme().colorblindMode).toBe('protanopia');
    });

    it('should set deuteranopia mode', () => {
      service.setColorblindMode('deuteranopia');
      expect(service.theme().colorblindMode).toBe('deuteranopia');
    });

    it('should set tritanopia mode', () => {
      service.setColorblindMode('tritanopia');
      expect(service.theme().colorblindMode).toBe('tritanopia');
    });

    it('should set monochrome mode', () => {
      service.setColorblindMode('monochrome');
      expect(service.theme().colorblindMode).toBe('monochrome');
    });

    it('should set none mode', () => {
      service.setColorblindMode('none');
      expect(service.theme().colorblindMode).toBe('none');
    });

    it('should persist colorblind mode to localStorage', async () => {
      service.setColorblindMode('protanopia');

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.colorblindMode).toBe('protanopia');
      }
    });
  });

  describe('Font Size', () => {
    it('should set font size to 80%', () => {
      service.setFontSize(80);
      expect(service.theme().fontSize).toBe(80);
    });

    it('should set font size to 100%', () => {
      service.setFontSize(100);
      expect(service.theme().fontSize).toBe(100);
    });

    it('should set font size to 150%', () => {
      service.setFontSize(150);
      expect(service.theme().fontSize).toBe(150);
    });

    it('should persist font size to localStorage', async () => {
      service.setFontSize(120);

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.fontSize).toBe(120);
      }
    });
  });

  describe('Reduced Motion', () => {
    it('should toggle reduced motion on', () => {
      const initial = service.theme().reduceMotion;
      service.toggleReducedMotion();
      expect(service.theme().reduceMotion).toBe(!initial);
    });

    it('should toggle reduced motion twice to return to original', () => {
      const initial = Boolean(service.theme().reduceMotion);
      service.toggleReducedMotion();
      service.toggleReducedMotion();
      expect(service.theme().reduceMotion).toBe(initial);
    });

    it('should persist reduced motion to localStorage', async () => {
      service.toggleReducedMotion();

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
    });
  });

  describe('Settings Update', () => {
    it('should update multiple settings at once', () => {
      service.updateSettings({
        mode: 'dark',
        fontSize: 120,
        reduceMotion: true,
      });

      const theme = service.theme();
      expect(theme.mode).toBe('dark');
      expect(theme.fontSize).toBe(120);
      expect(theme.reduceMotion).toBe(true);
    });

    it('should update only specified settings', () => {
      const initialColorblind = service.theme().colorblindMode;

      service.updateSettings({
        mode: 'light',
      });

      expect(service.theme().mode).toBe('light');
      expect(service.theme().colorblindMode).toBe(initialColorblind);
    });

    it('should persist updated settings', async () => {
      service.updateSettings({
        mode: 'dark',
        fontSize: 110,
      });

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.mode).toBe('dark');
        expect(parsed.fontSize).toBe(110);
      }
    });
  });

  describe('Reset to Defaults', () => {
    it('should reset all settings to defaults', () => {
      service.updateSettings({
        mode: 'dark',
        fontSize: 150,
        reduceMotion: true,
        colorblindMode: 'protanopia',
      });

      service.resetToDefaults();

      const theme = service.theme();
      expect(theme.mode).toBe('auto');
      expect(theme.colorblindMode).toBe('none');
      expect(theme.fontSize).toBe(100);
      expect(theme.reduceMotion).toBe(false);
    });

    it('should persist reset to localStorage', async () => {
      service.updateSettings({ mode: 'dark' });
      await new Promise((resolve) => setTimeout(resolve, 0));

      service.resetToDefaults();
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
    });
  });

  describe('Color Palette', () => {
    it('should get color palette', () => {
      const palette = service.getColorPalette();
      expect(palette).toBeDefined();
      expect(palette.primary).toBeTruthy();
      expect(palette.secondary).toBeTruthy();
      expect(palette.background).toBeTruthy();
    });

    it('should get different palettes for different modes', async () => {
      service.setMode('light');
      await new Promise((resolve) => setTimeout(resolve, 0));
      const lightPalette = service.getColorPalette();

      service.setMode('dark');
      await new Promise((resolve) => setTimeout(resolve, 0));
      const darkPalette = service.getColorPalette();

      expect(lightPalette.background).not.toBe(darkPalette.background);
    });

    it('should adjust colors for colorblind mode', () => {
      service.setColorblindMode('none');
      const normalPalette = service.getColorPalette();

      service.setColorblindMode('protanopia');
      const colorblindPalette = service.getColorPalette();

      expect(normalPalette).toBeDefined();
      expect(colorblindPalette).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('lixso-theme-settings', 'invalid-json{{{');

      // Service should still work with default theme
      expect(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          providers: [ThemeService],
        });
        const newService = TestBed.inject(ThemeService);
        const theme = newService.theme();
        expect(theme).toBeDefined();
        expect(theme.mode).toBeDefined();
      }).not.toThrow();
    });

    it('should use defaults when localStorage is empty', () => {
      localStorage.removeItem('lixso-theme-settings');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService],
      });
      const newService = TestBed.inject(ThemeService);
      const theme = newService.theme();

      expect(theme).toBeDefined();
      expect(theme.fontSize).toBe(100);
      expect(theme.colorblindMode).toBe('none');
    });
  });

  describe('Persistence', () => {
    it('should load saved settings on initialization', async () => {
      service.setMode('dark');
      service.setFontSize(120);
      await new Promise((resolve) => setTimeout(resolve, 0));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [ThemeService],
      });
      const newService = TestBed.inject(ThemeService);

      expect(newService.theme().mode).toBe('dark');
      expect(newService.theme().fontSize).toBe(120);
    });

    it('should save all settings to localStorage', async () => {
      service.updateSettings({
        mode: 'dark',
        colorblindMode: 'protanopia',
        fontSize: 120,
        reduceMotion: true,
      });

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.mode).toBe('dark');
        expect(parsed.colorblindMode).toBe('protanopia');
        expect(parsed.fontSize).toBe(120);
        expect(parsed.reduceMotion).toBe(true);
      }
    });
  });

  describe('Custom Accent Color', () => {
    it('should set custom accent color', () => {
      service.updateSettings({
        customAccentColor: '#FF0000',
      });

      expect(service.theme().customAccentColor).toBe('#FF0000');
    });

    it('should persist custom accent color', async () => {
      service.updateSettings({
        customAccentColor: '#00FF00',
      });

      // Wait for effect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('lixso-theme-settings');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.customAccentColor).toBe('#00FF00');
      }
    });

    it('should clear custom accent color', () => {
      service.updateSettings({
        customAccentColor: '#FF0000',
      });

      service.updateSettings({
        customAccentColor: undefined,
      });

      expect(service.theme().customAccentColor).toBeUndefined();
    });
  });
});
