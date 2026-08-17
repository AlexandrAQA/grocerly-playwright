import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local", quiet: true });

import { defineConfig, devices } from "@playwright/test";

/**
 * Two independent suites live in this repository:
 *
 * 1. `app-*` projects run against **Grocerly**, a real grocery e-commerce app
 *    (Angular + PrimeNG, Convex backend, Clerk auth, Stripe checkout). The
 *    product source is maintained in a separate private repository, so the app
 *    has to be started locally on http://localhost:4200 before running these
 *    tests (see README).
 *
 * 2. `demo-*` projects run against a public demo shop, so the suite is
 *    reproducible for anyone who clones the repo and is executed on every push
 *    in CI. Same architecture as the app suite: Page Object Model, fixtures,
 *    storage-state authentication, accessibility and visual checks.
 *
 * `globalSetup` wires up @clerk/testing for the app suite; it no-ops when Clerk
 * credentials are absent, so everything else still runs without secrets.
 */

const DEMO_BASE_URL = process.env["DEMO_BASE_URL"] ?? "https://www.saucedemo.com";
const APP_BASE_URL = process.env["APP_BASE_URL"] ?? "http://localhost:4200";
const isCI = Boolean(process.env["CI"]);

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  use: {
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    /* ---------- public demo suite: runs anywhere, including CI ---------- */
    {
      name: "demo-setup",
      testDir: "./e2e/demo",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: DEMO_BASE_URL },
    },
    {
      name: "demo-chromium",
      testDir: "./e2e/demo",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["demo-setup"],
      use: { ...devices["Desktop Chrome"], baseURL: DEMO_BASE_URL },
    },
    {
      name: "demo-firefox",
      testDir: "./e2e/demo",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["demo-setup"],
      use: { ...devices["Desktop Firefox"], baseURL: DEMO_BASE_URL },
    },
    {
      name: "demo-webkit",
      testDir: "./e2e/demo",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["demo-setup"],
      use: { ...devices["Desktop Safari"], baseURL: DEMO_BASE_URL },
    },
    {
      name: "demo-mobile",
      testDir: "./e2e/demo",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["demo-setup"],
      use: { ...devices["Pixel 5"], baseURL: DEMO_BASE_URL },
    },

    /* ---------- mocked UI suite: deterministic catalogue states ---------- */
    {
      name: "mock",
      testDir: "./e2e/mock",
      testMatch: /.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: process.env["SHOP_BASE_URL"] ?? "https://practicesoftwaretesting.com" },
    },

    /* ---------- API suite: contract and auth checks, no browser UI ---------- */
    {
      name: "api",
      testDir: "./e2e/api",
      testMatch: /.*\.spec\.ts/,
      use: { baseURL: process.env["API_BASE_URL"] ?? "https://api.practicesoftwaretesting.com" },
    },

    /* ---------- private app suite: needs the app on localhost ---------- */
    {
      name: "app-chromium",
      testDir: "./e2e",
      testMatch: /e2e[\\/][^\\/]*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], baseURL: APP_BASE_URL },
    },
    {
      name: "app-mobile",
      testDir: "./e2e",
      testMatch: /e2e[\\/][^\\/]*\.spec\.ts/,
      use: { ...devices["Pixel 5"], baseURL: APP_BASE_URL },
    },
  ],
});
