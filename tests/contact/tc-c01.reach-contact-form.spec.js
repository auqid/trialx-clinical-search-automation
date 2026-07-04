// @ts-check
import { test, expect } from '../../fixtures';
import { reachContactForm } from './helpers';

/**
 * TC-C01 — Reach the contact form.
 * From a featured trial, select a site and advance; the "Send a message" form
 * renders with all fields + both consent checkboxes, and the selected site is shown.
 */
test('TC-C01 selecting a site reveals the contact form for that site @smoke @regression', async ({
  featuredTrial,
  trialDetailPage,
  siteWidgetPage,
  contactFormPage,
}) => {
  // featuredTrial ensures we are on a real featured trial (guarded, not a microsite).
  expect(featuredTrial.url).toMatch(/\/clinical-trials\/listings\/\d+\//);

  const { siteName } = await reachContactForm({
    trialDetailPage,
    siteWidgetPage,
    contactFormPage,
  });

  await expect(contactFormPage.form).toBeVisible();
  await expect(contactFormPage.firstNameInput).toBeVisible();
  await expect(contactFormPage.lastNameInput).toBeVisible();
  await expect(contactFormPage.emailInput).toBeVisible();
  await expect(contactFormPage.phoneInput).toBeVisible();
  // Consent inputs are Bootstrap custom controls (visually hidden) — assert attached.
  await expect(contactFormPage.ageConsentCheckbox).toBeAttached();
  await expect(contactFormPage.termsConsentCheckbox).toBeAttached();

  // The selected site is shown on the contact step (pick a visible occurrence —
  // the site name also exists in the now-hidden site-selection pane).
  await expect(
    contactFormPage.form.getByText(siteName).filter({ visible: true }).first(),
  ).toBeVisible({ timeout: 20_000 });
});
