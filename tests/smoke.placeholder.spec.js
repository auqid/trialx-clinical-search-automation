// @ts-check
import { test, expect } from '@playwright/test';

/**
 * TEMPORARY PLACEHOLDER — delete once real specs land.
 *
 * Proves the config + global setup work end to end:
 *  - navigates to the env-driven `baseURL` (from `.env`) and checks it has a title;
 *  - asserts the OneTrust consent banner is NOT visible, confirming the consented
 *    `storageState` from global-setup is being applied (banner won't block clicks).
 * No page objects, fixtures, or app-specific assertions belong here yet.
 */
test('placeholder: base URL loads, has a title, and consent banner is dismissed', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  await expect(page.locator('#onetrust-banner-sdk')).toBeHidden();
});
