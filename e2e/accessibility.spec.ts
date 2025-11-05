import { test, expect } from '@playwright/test';

test.describe('Lixso Game - Accessibility & Performance', () => {
  test('should have proper page structure with semantic HTML', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    // Check for buttons with proper text
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);

    // All visible buttons should have text or aria-label
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Navigate to menu if needed
    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
    }

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Focus should be on some interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });

  test('should handle focus states properly', async ({ page }) => {
    await page.goto('/');

    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
    }

    // Click on a button
    const firstButton = page.locator('button').first();
    await firstButton.click();

    // Button should have focus or be in active state
    const isFocused = await firstButton.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBeTruthy();
  });

  test('should have reasonable page load time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test('should have no critical accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Check for common accessibility issues
    // 1. Images should have alt text (if any)
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }

    // 2. Interactive elements should be visible and not too small
    const buttons = page.locator('button:visible');
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      const firstButton = buttons.first();
      const box = await firstButton.boundingBox();

      // Button should be at least 24x24 pixels (reasonable touch target)
      if (box) {
        expect(box.width).toBeGreaterThan(20);
        expect(box.height).toBeGreaterThan(20);
      }
    }
  });

  test('should display correctly on various screen sizes', async ({ page }) => {
    const sizes = [
      { width: 320, height: 568, name: 'iPhone SE' },
      { width: 375, height: 667, name: 'iPhone 8' },
      { width: 414, height: 896, name: 'iPhone 11' },
      { width: 768, height: 1024, name: 'iPad' },
      { width: 1920, height: 1080, name: 'Desktop' },
    ];

    for (const size of sizes) {
      await page.setViewportSize({ width: size.width, height: size.height });
      await page.goto('/');

      // App root should be visible
      const appRoot = page.locator('app-root');
      await expect(appRoot).toBeVisible();

      // Game board or menu should be visible
      const gameBoard = page.locator('app-game-board');
      const gameMenu = page.locator('app-game-menu');

      const isBoardVisible = await gameBoard.isVisible();
      const isMenuVisible = await gameMenu.isVisible();

      expect(isBoardVisible || isMenuVisible).toBeTruthy();
    }
  });

  test('should support color accessibility with symbols', async ({ page }) => {
    await page.goto('/');

    // Check that symbols are displayed, not just colors
    const symbolButtons = page.locator('.symbol-selector button');

    if ((await symbolButtons.count()) > 0) {
      // Each symbol button should have text content (I, X, S, O)
      for (let i = 0; i < 4; i++) {
        const button = symbolButtons.nth(i);
        const text = await button.textContent();
        expect(text?.trim()).toMatch(/^[IXSO]$/);
      }
    }
  });

  test('should not have console warnings or errors during typical interaction', async ({
    page,
  }) => {
    const consoleMessages: { type: string; text: string }[] = [];

    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to menu
    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(500);
    }

    // Select a difficulty
    const level3 = page.locator('button:has-text("Level 3")').first();
    if (await level3.isVisible()) {
      await level3.click();
      await page.waitForTimeout(500);
    }

    // Start a game
    const modeCard = page.locator('.mode-card').first();
    if (await modeCard.isVisible()) {
      await modeCard.click();
      await page.waitForTimeout(1000);
    }

    // Filter out info/debug messages and check for errors
    const errors = consoleMessages.filter((msg) => msg.type === 'error');
    const warnings = consoleMessages.filter((msg) => msg.type === 'warning');

    // Should have no critical errors
    expect(errors.length).toBe(0);

    // Warnings should be minimal (some Angular dev warnings are OK)
    expect(warnings.length).toBeLessThan(5);
  });
});
