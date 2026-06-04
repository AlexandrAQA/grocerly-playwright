import { defineConfig, devices } from '@playwright/test';

/**
 * The application under test (Grocerly) is a separate project and is NOT
 * included in this repository. Start it locally on http://localhost:4200
 * before running the tests (see README). `baseURL` lets specs use relative
 * paths like `page.goto('/')`.
 */
export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
