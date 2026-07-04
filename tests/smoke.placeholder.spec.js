// @ts-check
import { test, expect } from '@playwright/test';

/**
 * TEMPORARY PLACEHOLDER — delete once real specs land.
 *
 * Its only job is to prove the config works: it navigates to the env-driven
 * `baseURL` (from `.env`) and asserts the page has a non-empty <title>.
 * No page objects, fixtures, or app-specific assertions belong here yet.
 */
test('placeholder: base URL loads and has a title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
});
