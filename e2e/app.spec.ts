import { expect, test } from '@playwright/test';

test.describe('Lixso Game - Basic Loading', () => {
  test('should load the application and display title', async ({ page }) => {
    await page.goto('/');

    // Check if the page title is correct
    await expect(page).toHaveTitle(/LixsoGame/);
  });

  test('should display the game board', async ({ page }) => {
    await page.goto('/');

    // Wait for the app root to be present
    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    // Check if game board is present
    const gameBoard = page.locator('app-game-board');
    await expect(gameBoard).toBeVisible({ timeout: 10000 });
  });

  test('should have no console errors on initial load', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    const appRoot = page.locator('app-root');
    await expect(appRoot).toBeVisible();

    const gameBoard = page.locator('app-game-board');
    await expect(gameBoard).toBeVisible();
  });
});
