import { test, expect } from '@playwright/test';

test.describe('Lixso Game - Complete Game Flow', () => {
  test('should complete full game flow from menu to playing', async ({ page }) => {
    // Step 1: Navigate to the application
    await page.goto('/');
    await expect(page.locator('app-root')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/01-initial-load.png', fullPage: true });

    // Step 2: Navigate to menu if we start on game view
    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/02-navigated-to-menu.png', fullPage: true });
    }

    // Step 3: Enter player name
    const playerNameInput = page.locator('#playerName');
    await expect(playerNameInput).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/03-menu-visible.png', fullPage: true });

    await playerNameInput.fill('TestMaster2024');
    await playerNameInput.blur();
    await page.waitForTimeout(300);

    // Verify name was entered
    await expect(playerNameInput).toHaveValue('TestMaster2024');
    await page.screenshot({ path: 'test-results/screenshots/04-player-name-entered.png', fullPage: true });

    // Step 4: Select difficulty level (Level 1 for easier testing)
    const level1Button = page
      .locator('.difficulty-selector button')
      .filter({ hasText: 'Level 1' })
      .first();
    await expect(level1Button).toBeVisible();
    await level1Button.click();
    await expect(level1Button).toHaveClass(/active/);
    await page.screenshot({ path: 'test-results/screenshots/05-difficulty-selected.png', fullPage: true });

    // Step 5: Select game mode (Classic mode - first mode card)
    const classicModeCard = page.locator('.mode-card').first();
    await expect(classicModeCard).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/06-before-game-start.png', fullPage: true });

    await classicModeCard.click();

    // Step 6: Verify we're in the game view
    await expect(page.locator('app-game-board')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.game-header h1')).toContainText('LIXSO');

    // Verify difficulty level is displayed correctly
    const difficultyBadge = page.locator('.difficulty-badge');
    await expect(difficultyBadge).toContainText('Level 1');
    await page.screenshot({ path: 'test-results/screenshots/07-game-board-loaded.png', fullPage: true });

    // Step 7: Interact with game controls - Select a symbol
    const symbolI = page.locator('.symbol-selector button:has-text("I")');
    await expect(symbolI).toBeVisible();
    await symbolI.click();
    await expect(symbolI).toHaveClass(/active/);
    await page.screenshot({ path: 'test-results/screenshots/08-symbol-I-selected.png', fullPage: true });

    // Step 8: Select an orientation
    const firstOrientation = page.locator('.orientation-selector button').first();
    await expect(firstOrientation).toBeVisible();
    await firstOrientation.click();
    await expect(firstOrientation).toHaveClass(/active/);
    await page.screenshot({ path: 'test-results/screenshots/09-orientation-selected.png', fullPage: true });

    // Step 9: Try to place a tile on the grid
    const gridCells = page.locator('.grid-container .grid .grid-row > div');
    await expect(gridCells.first()).toBeVisible();

    // Find a non-prefilled cell to click
    const cellCount = await gridCells.count();
    let clickedCell = false;

    for (let i = 0; i < Math.min(cellCount, 10); i++) {
      const cell = gridCells.nth(i);
      const cellClass = await cell.getAttribute('class');

      // Try to click cells that don't have prefilled class
      if (!cellClass?.includes('prefilled')) {
        await cell.click({ force: true });
        clickedCell = true;
        await page.waitForTimeout(500);
        break;
      }
    }

    expect(clickedCell).toBeTruthy();
    await page.screenshot({ path: 'test-results/screenshots/10-first-tile-placed.png', fullPage: true });

    // Step 10: Try different symbols and orientations
    const symbolX = page.locator('.symbol-selector button:has-text("X")');
    await symbolX.click();
    await expect(symbolX).toHaveClass(/active/);
    await page.screenshot({ path: 'test-results/screenshots/11-symbol-X-selected.png', fullPage: true });

    const rotateButton = page.locator('button:has-text("Rotate")');
    await rotateButton.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/screenshots/12-after-rotation.png', fullPage: true });

    // Step 11: Test hint functionality
    const hintButton = page.locator('button:has-text("Hint")');
    await expect(hintButton).toBeVisible();
    await hintButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/13-after-hint.png', fullPage: true });

    // Step 12: Continue placing tiles (try to place a few more)
    for (let attempt = 0; attempt < 3; attempt++) {
      // Try different symbols
      const symbols = ['S', 'O', 'I'];
      const symbolButton = page.locator(
        `.symbol-selector button:has-text("${symbols[attempt]}")`
      );
      await symbolButton.click();

      // Rotate to different orientation
      await rotateButton.click();
      await page.waitForTimeout(200);

      // Try to click on another cell
      for (let i = attempt * 3; i < Math.min(cellCount, (attempt + 1) * 3); i++) {
        const cell = gridCells.nth(i);
        const cellClass = await cell.getAttribute('class');

        if (!cellClass?.includes('prefilled')) {
          await cell.click({ force: true });
          await page.waitForTimeout(300);
          break;
        }
      }

      await page.screenshot({
        path: `test-results/screenshots/14-tile-placement-attempt-${attempt + 1}.png`,
        fullPage: true
      });
    }

    await page.screenshot({ path: 'test-results/screenshots/15-multiple-tiles-placed.png', fullPage: true });

    // Step 13: Test reset functionality
    const resetButton = page.locator('button:has-text("Reset")');
    await expect(resetButton).toBeVisible();
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify game is still visible after reset
    await expect(page.locator('app-game-board')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/16-after-reset.png', fullPage: true });

    // Step 14: Try to start a new game with different difficulty
    const level2Button = page
      .locator('.difficulty-selector button')
      .filter({ hasText: 'Level 2' })
      .last();
    await level2Button.click();
    await page.waitForTimeout(500);

    // Verify difficulty changed
    await expect(difficultyBadge).toContainText('Level 2');
    await page.screenshot({ path: 'test-results/screenshots/17-difficulty-changed-to-level-2.png', fullPage: true });

    // Step 15: Navigate back to menu
    const backToMenuButton = page.locator('button:has-text("Back to Menu")');
    await expect(backToMenuButton).toBeVisible();
    await backToMenuButton.click();

    // Step 16: Verify we're back at the menu
    await expect(page.locator('.menu-header h1')).toBeVisible();
    await expect(page.locator('.menu-header h1')).toContainText('LIXSO');

    // Verify player name is still there
    await expect(playerNameInput).toHaveValue('TestMaster2024');
    await page.screenshot({ path: 'test-results/screenshots/18-back-to-menu-final.png', fullPage: true });
  });

  test('should handle game completion flow', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'test-results/screenshots/completion-01-initial.png', fullPage: true });

    // Navigate to menu if needed
    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/screenshots/completion-02-menu.png', fullPage: true });
    }

    // Select Level 1 for simplest puzzle
    const level1Button = page
      .locator('.difficulty-selector button')
      .filter({ hasText: 'Level 1' })
      .first();
    await level1Button.click();
    await page.screenshot({ path: 'test-results/screenshots/completion-03-level-selected.png', fullPage: true });

    // Start game
    const firstMode = page.locator('.mode-card').first();
    await firstMode.click();

    await expect(page.locator('app-game-board')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/completion-04-game-started.png', fullPage: true });

    // Check if completion message appears (it might if puzzle is already solved)
    const completionMessage = page.locator('.completion-message');

    // Wait a bit to see if game is already complete or becomes complete
    await page.waitForTimeout(1000);

    if (await completionMessage.isVisible()) {
      // Verify completion message content
      await expect(completionMessage).toContainText('Puzzle Completed');
      await expect(completionMessage).toContainText('Congratulations');
      await page.screenshot({ path: 'test-results/screenshots/completion-05-puzzle-completed.png', fullPage: true });
    } else {
      await page.screenshot({ path: 'test-results/screenshots/completion-05-puzzle-in-progress.png', fullPage: true });
    }

    // Game should remain functional even if complete
    await expect(page.locator('.symbol-selector')).toBeVisible();
    await expect(page.locator('.orientation-selector')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/completion-06-final-state.png', fullPage: true });
  });

  test('should maintain state across difficulty changes', async ({ page }) => {
    await page.goto('/');
    await page.screenshot({ path: 'test-results/screenshots/state-01-initial.png', fullPage: true });

    // Navigate to menu
    const backButton = page.locator('button:has-text("Back to Menu")');
    if (await backButton.isVisible()) {
      await backButton.click();
      await page.screenshot({ path: 'test-results/screenshots/state-02-menu.png', fullPage: true });
    }

    // Enter a unique player name
    const playerNameInput = page.locator('#playerName');
    await playerNameInput.fill('StateTestPlayer');
    await playerNameInput.blur();
    await page.screenshot({ path: 'test-results/screenshots/state-03-name-entered.png', fullPage: true });

    // Start with Level 1
    const level1 = page.locator('.difficulty-selector button').filter({ hasText: 'Level 1' }).first();
    await level1.click();
    await page.screenshot({ path: 'test-results/screenshots/state-04-level1-selected.png', fullPage: true });

    // Start game
    const modeCard = page.locator('.mode-card').first();
    await modeCard.click();

    await expect(page.locator('app-game-board')).toBeVisible();
    await page.screenshot({ path: 'test-results/screenshots/state-05-game-started.png', fullPage: true });

    // Place a tile
    const symbolI = page.locator('.symbol-selector button:has-text("I")');
    await symbolI.click();

    const firstOrientation = page.locator('.orientation-selector button').first();
    await firstOrientation.click();
    await page.screenshot({ path: 'test-results/screenshots/state-06-tile-controls-set.png', fullPage: true });

    // Try to place a tile
    const cells = page.locator('.grid-container .grid .grid-row > div');
    await cells.first().click({ force: true });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/state-07-tile-placed.png', fullPage: true });

    // Change difficulty (should reset the game)
    const level3 = page.locator('.difficulty-selector button').filter({ hasText: 'Level 3' }).last();
    await level3.click();
    await page.waitForTimeout(500);

    // Verify difficulty changed
    const difficultyBadge = page.locator('.difficulty-badge');
    await expect(difficultyBadge).toContainText('Level 3');
    await page.screenshot({ path: 'test-results/screenshots/state-08-difficulty-changed.png', fullPage: true });

    // Game should still be playable
    await expect(page.locator('.symbol-selector')).toBeVisible();
    await symbolI.click();
    await cells.first().click({ force: true });
    await page.screenshot({ path: 'test-results/screenshots/state-09-new-tile-placed.png', fullPage: true });

    // Navigate back to menu and verify player name persists
    await page.locator('button:has-text("Back to Menu")').click();
    await expect(playerNameInput).toHaveValue('StateTestPlayer');
    await page.screenshot({ path: 'test-results/screenshots/state-10-back-to-menu.png', fullPage: true });
  });
});
