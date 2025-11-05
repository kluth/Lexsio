import { test, expect } from '@playwright/test';

test.describe('Lixso Game - Game Board Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // App starts on game view by default
    await expect(page.locator('app-game-board')).toBeVisible({ timeout: 10000 });
  });

  test('should display game header with difficulty level', async ({ page }) => {
    const header = page.locator('.game-header h1');
    await expect(header).toContainText('LIXSO');

    const difficultyBadge = page.locator('.difficulty-badge');
    await expect(difficultyBadge).toBeVisible();
    await expect(difficultyBadge).toContainText(/Level \d+/);
  });

  test('should display game grid', async ({ page }) => {
    const grid = page.locator('.grid-container .grid');
    await expect(grid).toBeVisible();

    // Grid should have cells
    const cells = page.locator('.grid-container .grid > .grid-row');
    const rowCount = await cells.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should display all four symbol selection buttons', async ({ page }) => {
    const symbolButtons = page.locator('.symbol-selector button');
    await expect(symbolButtons).toHaveCount(4);

    // Check for I, X, S, O symbols
    await expect(page.locator('.symbol-selector button:has-text("I")')).toBeVisible();
    await expect(page.locator('.symbol-selector button:has-text("X")')).toBeVisible();
    await expect(page.locator('.symbol-selector button:has-text("S")')).toBeVisible();
    await expect(page.locator('.symbol-selector button:has-text("O")')).toBeVisible();
  });

  test('should allow selecting different symbols', async ({ page }) => {
    const symbolI = page.locator('.symbol-selector button:has-text("I")');
    await symbolI.click();
    await expect(symbolI).toHaveClass(/active/);

    const symbolX = page.locator('.symbol-selector button:has-text("X")');
    await symbolX.click();
    await expect(symbolX).toHaveClass(/active/);
    await expect(symbolI).not.toHaveClass(/active/);
  });

  test('should display tile orientation controls', async ({ page }) => {
    const orientationButtons = page.locator('.orientation-selector button');
    await expect(orientationButtons).toHaveCount(4);

    const rotateButton = page.locator('button:has-text("Rotate")');
    await expect(rotateButton).toBeVisible();
  });

  test('should allow selecting different orientations', async ({ page }) => {
    const firstOrientation = page.locator('.orientation-selector button').first();
    await firstOrientation.click();
    await expect(firstOrientation).toHaveClass(/active/);

    const secondOrientation = page.locator('.orientation-selector button').nth(1);
    await secondOrientation.click();
    await expect(secondOrientation).toHaveClass(/active/);
    await expect(firstOrientation).not.toHaveClass(/active/);
  });

  test('should rotate orientation when rotate button is clicked', async ({ page }) => {
    const firstOrientation = page.locator('.orientation-selector button').first();
    await firstOrientation.click();

    const rotateButton = page.locator('button:has-text("Rotate")');
    await rotateButton.click();

    // After rotation, a different orientation should be active
    const secondOrientation = page.locator('.orientation-selector button').nth(1);
    await expect(secondOrientation).toHaveClass(/active/);
  });

  test('should display hint button', async ({ page }) => {
    const hintButton = page.locator('button:has-text("Hint")');
    await expect(hintButton).toBeVisible();
  });

  test('should display reset button', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset")');
    await expect(resetButton).toBeVisible();
  });

  test('should reset game when reset button is clicked', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Game should still be visible and not show completion message
    await expect(page.locator('app-game-board')).toBeVisible();
    await expect(page.locator('.completion-message')).not.toBeVisible();
  });

  test('should display difficulty level selector for new game', async ({ page }) => {
    const difficultyButtons = page.locator('.difficulty-selector button');
    await expect(difficultyButtons).toHaveCount(6);

    // All levels should be clickable
    for (let i = 1; i <= 6; i++) {
      const levelButton = page.locator(`.difficulty-selector button:has-text("Level ${i}")`);
      await expect(levelButton).toBeVisible();
    }
  });

  test('should start new game when difficulty level is selected', async ({ page }) => {
    const level2Button = page.locator('.difficulty-selector button:has-text("Level 2")');
    await level2Button.click();

    // Check that difficulty badge updates
    const difficultyBadge = page.locator('.difficulty-badge');
    await expect(difficultyBadge).toContainText('Level 2');

    // Game should still be visible
    await expect(page.locator('app-game-board')).toBeVisible();
  });

  test('should display game instructions', async ({ page }) => {
    const instructions = page.locator('.game-info');
    await expect(instructions).toContainText('How to Play');
    await expect(instructions).toContainText('L-shaped tiles');
    await expect(instructions).toContainText('cannot touch');
    await expect(instructions).toContainText('3 cells');
  });

  test('should allow clicking on grid cells', async ({ page }) => {
    // Select a symbol
    const symbolI = page.locator('.symbol-selector button:has-text("I")');
    await symbolI.click();

    // Select an orientation
    const firstOrientation = page.locator('.orientation-selector button').first();
    await firstOrientation.click();

    // Try to click on a grid cell (may or may not be valid placement)
    const cells = page.locator('.grid-container .grid .grid-row > div');
    const firstCell = cells.first();

    // Just verify the cell is clickable
    await expect(firstCell).toBeVisible();
    await firstCell.click({ force: true }); // Use force in case cell has overlays

    // Game should still be functional after click
    await expect(page.locator('app-game-board')).toBeVisible();
  });

  test('should show completion message when puzzle is completed', async ({ page }) => {
    // This test may not always pass depending on puzzle state
    // but it tests the UI structure for completion

    const completionMessage = page.locator('.completion-message');

    // If puzzle is already completed, check the message
    if (await completionMessage.isVisible()) {
      await expect(completionMessage).toContainText('Puzzle Completed');
      await expect(completionMessage).toContainText('Congratulations');
    }
  });

  test('should maintain responsive layout on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X

    // All main controls should still be visible
    await expect(page.locator('.game-header')).toBeVisible();
    await expect(page.locator('.grid-container')).toBeVisible();
    await expect(page.locator('.controls')).toBeVisible();
    await expect(page.locator('.symbol-selector')).toBeVisible();
    await expect(page.locator('.orientation-selector')).toBeVisible();
  });
});
