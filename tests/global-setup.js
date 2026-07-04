// @ts-check
const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

/* Read the environment the same way playwright.config.js does. */
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = process.env.BASE_URL || 'https://dev-connect.ainfo.io/clinical-trials/listings/';
const STORAGE_STATE = path.resolve(process.cwd(), '.auth', 'consent.json');
const CONSENT_TIMEOUT = 10_000;

/**
 * Global setup: accept the OneTrust cookie banner ONCE and persist the resulting
 * cookies/localStorage to `.auth/consent.json`. Every project reuses this via
 * `storageState`, so the banner never re-renders to intercept clicks in real tests.
 *
 * If the banner doesn't appear within a short timeout (already consented, or the
 * environment doesn't serve it), we log and continue — we never fail the run here.
 */
module.exports = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    const acceptButton = page.locator('#onetrust-accept-btn-handler');
    try {
      await acceptButton.waitFor({ state: 'visible', timeout: CONSENT_TIMEOUT });
      await acceptButton.click();
      // Wait for the banner to disappear — confirms OneTrust registered consent
      // (and wrote its cookies) before we snapshot the storage state.
      await page
        .locator('#onetrust-banner-sdk')
        .waitFor({ state: 'hidden', timeout: CONSENT_TIMEOUT });
      console.log('[global-setup] OneTrust banner accepted.');
    } catch {
      console.log(
        '[global-setup] OneTrust banner did not appear within timeout — continuing without accepting.',
      );
    }

    fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
    await context.storageState({ path: STORAGE_STATE });
    console.log(`[global-setup] Saved consented storage state to ${STORAGE_STATE}`);
  } finally {
    await browser.close();
  }
};
