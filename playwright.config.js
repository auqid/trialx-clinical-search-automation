// @ts-check
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Load environment variables from `.env` (see `.env.example` for the contract).
 * Resolve from `process.cwd()` (the repo root, where `.env` lives) so this works
 * regardless of module system — avoids CommonJS `__dirname` and ESM
 * `import.meta.url`, either of which breaks under the wrong package "type".
 * https://github.com/motdotla/dotenv
 */
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Everything environment-specific is read from `process.env` so the same config
 * can target dev / staging / prod by swapping `.env` — nothing is hardcoded.
 */
const BASE_URL = process.env.BASE_URL || 'https://dev-connect.ainfo.io/clinical-trials/listings/';
const ACTION_TIMEOUT = Number(process.env.ACTION_TIMEOUT) || 15_000;
const NAVIGATION_TIMEOUT = Number(process.env.NAVIGATION_TIMEOUT) || 30_000;
const TEST_TIMEOUT = Number(process.env.TEST_TIMEOUT) || 60_000;
const EXPECT_TIMEOUT = Number(process.env.EXPECT_TIMEOUT) || 10_000;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  /* Per-test timeout. */
  timeout: TEST_TIMEOUT,
  expect: { timeout: EXPECT_TIMEOUT },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /*
   * Retries: 2 on CI, 1 locally. The suite runs against a SHARED dev server that
   * occasionally responds slowly under our own parallel load (navigation/XHR waits
   * can blip past their timeouts). A single retry absorbs those transient failures;
   * Playwright still reports the test as "flaky", so real instability stays visible.
   */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporters: rich HTML report, live list output, and JUnit XML for CI. */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['junit', { outputFile: 'test-results/junit/results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL so tests can navigate with `page.goto('/')`. Sourced from `.env`. */
    baseURL: BASE_URL,
    actionTimeout: ACTION_TIMEOUT,
    navigationTimeout: NAVIGATION_TIMEOUT,
    /* Diagnostics: keep artifacts only when something goes wrong. */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },

  /*
   * Accept the OneTrust cookie banner once and persist the consented browser
   * state to `.auth/consent.json` (gitignored). Every project below reuses it
   * via `storageState`, so tests start already-consented.
   */
  globalSetup: './tests/global-setup.js',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/consent.json',
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: '.auth/consent.json',
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: '.auth/consent.json',
      },
    },

    /* Mobile viewports — enable in a later commit when responsive specs land. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});
