# End-to-End Tests with Playwright

This directory contains end-to-end (E2E) tests for the Lixso game application using [Playwright](https://playwright.dev/).

## Test Files

- **app.spec.ts** - Basic application loading and responsiveness tests
- **game-menu.spec.ts** - Menu navigation and interaction tests
- **game-board.spec.ts** - Game board controls and interactions
- **accessibility.spec.ts** - Accessibility and performance tests
- **complete-game-flow.spec.ts** - Full game flow from menu to gameplay with screenshots

## Running Tests

### Prerequisites

Make sure you have installed dependencies and Playwright browsers:

```bash
npm install
npx playwright install
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Recommended for Development)

```bash
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- See tests run in real-time
- Debug failed tests
- Inspect DOM and screenshots
- Time-travel through test execution

### Run Tests in Headed Mode

```bash
npm run test:e2e:headed
```

Watch the tests run in an actual browser window.

### Debug a Specific Test

```bash
npm run test:e2e:debug
```

### Run a Specific Test File

```bash
npm run test:e2e -- e2e/game-board.spec.ts
```

### Run a Specific Test

```bash
npm run test:e2e -- -g "should load the application"
```

### Run Tests in a Specific Browser

```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

## Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

## Screenshots

The complete game flow tests capture screenshots at every step and save them to:
```
test-results/screenshots/
```

These screenshots are useful for:
- Visual regression testing
- Debugging test failures
- Documentation
- Understanding the user flow

## Code Generation

Generate new tests by recording your actions:

```bash
npm run test:e2e:codegen
```

This will:
1. Start your dev server
2. Open a browser with Playwright Inspector
3. Record your interactions
4. Generate test code automatically

## CI/CD Integration

E2E tests run automatically in CI/CD pipelines:
- On every push (test.yml workflow)
- Before deployment (ci-cd.yml workflow)

Reports and screenshots from failed tests are uploaded as artifacts.

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Write independent tests** that can run in any order
3. **Take screenshots** for important states
4. **Use meaningful test descriptions**
5. **Group related tests** with `test.describe()`
6. **Handle async properly** with await
7. **Use page objects** for complex interactions

### Adding Screenshots

```typescript
await page.screenshot({
  path: 'test-results/screenshots/my-screenshot.png',
  fullPage: true
});
```

## Browser Support

Tests run on:
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Configuration

Playwright configuration is in `playwright.config.ts`:
- Test directory: `./e2e`
- Base URL: `http://localhost:4200`
- Timeout: 30 seconds per test
- Retries: 2 (in CI only)
- Screenshots: On failure
- Traces: On first retry

## Troubleshooting

### Tests Timeout

Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60000 // 60 seconds
```

### Dev Server Not Starting

Make sure port 4200 is available:
```bash
lsof -ti:4200 | xargs kill -9
```

### Browser Installation Issues

Reinstall browsers:
```bash
npx playwright install --force
```

### Debugging Flaky Tests

Use trace viewer:
```bash
npx playwright show-trace test-results/trace.zip
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Test Generator](https://playwright.dev/docs/codegen)
- [Debugging Tests](https://playwright.dev/docs/debug)
