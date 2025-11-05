import { test, expect } from '@playwright/test';

test.describe('Lixso Game - Menu Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Note: App starts on 'game' view by default, need to navigate to menu
    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
    }
  });

  test('should display game menu with header', async ({ page }) => {
    const menuHeader = page.locator('.menu-header h1');
    await expect(menuHeader).toContainText('LIXSO');

    const tagline = page.locator('.tagline');
    await expect(tagline).toContainText('The Ultimate Logic Puzzle Game');
  });

  test('should allow player to enter their name', async ({ page }) => {
    const nameInput = page.locator('#playerName');
    await expect(nameInput).toBeVisible();

    await nameInput.fill('TestPlayer123');
    await nameInput.blur();

    // Name should be persisted
    await expect(nameInput).toHaveValue('TestPlayer123');
  });

  test('should display all difficulty levels', async ({ page }) => {
    const difficultyButtons = page.locator('.difficulty-buttons button');
    await expect(difficultyButtons).toHaveCount(6);

    // Check that all levels are present
    for (let i = 1; i <= 6; i++) {
      await expect(page.locator(`button:has-text("Level ${i}")`)).toBeVisible();
    }
  });

  test('should allow selecting different difficulty levels', async ({ page }) => {
    const level3Button = page.locator('.difficulty-selector button:has-text("Level 3")');
    await level3Button.click();
    await expect(level3Button).toHaveClass(/active/);

    const level5Button = page.locator('.difficulty-selector button:has-text("Level 5")');
    await level5Button.click();
    await expect(level5Button).toHaveClass(/active/);
    await expect(level3Button).not.toHaveClass(/active/);
  });

  test('should display game mode cards', async ({ page }) => {
    const modeCards = page.locator('.mode-card');
    await expect(modeCards.first()).toBeVisible();

    // Should have multiple game modes
    const count = await modeCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to game when mode is selected', async ({ page }) => {
    const firstModeCard = page.locator('.mode-card').first();
    await firstModeCard.click();

    // Should navigate to game view
    await expect(page.locator('app-game-board')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Back to Menu")')).toBeVisible();
  });

  test('should display highscores button and navigate', async ({ page }) => {
    const highscoresButton = page.locator('button:has-text("Highscores")');
    await expect(highscoresButton).toBeVisible();

    await highscoresButton.click();

    // Should navigate to highscores view
    await expect(page.locator('h2:has-text("Highscores")')).toBeVisible();
    await expect(page.locator('button:has-text("Back to Menu")')).toBeVisible();
  });

  test('should display tournaments button and navigate', async ({ page }) => {
    const tournamentsButton = page.locator('button:has-text("Tournaments")');
    await expect(tournamentsButton).toBeVisible();

    await tournamentsButton.click();

    // Should navigate to tournaments view
    await expect(page.locator('h2:has-text("Tournaments")')).toBeVisible();
    await expect(page.locator('button:has-text("Back to Menu")')).toBeVisible();
  });

  test('should display game instructions', async ({ page }) => {
    const instructions = page.locator('.game-info-footer');
    await expect(instructions).toContainText('How to Play');
    await expect(instructions).toContainText('L-shaped tiles');
    await expect(instructions).toContainText('cannot touch');
  });

  test('should navigate back to menu from game', async ({ page }) => {
    const firstModeCard = page.locator('.mode-card').first();
    await firstModeCard.click();

    // Wait for game to load
    await expect(page.locator('app-game-board')).toBeVisible();

    // Click back button
    const backButton = page.locator('button:has-text("Back to Menu")');
    await backButton.click();

    // Should be back at menu
    await expect(page.locator('.menu-header h1')).toBeVisible();
  });
});
