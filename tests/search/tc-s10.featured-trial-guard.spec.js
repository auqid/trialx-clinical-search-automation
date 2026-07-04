// @ts-check
import { test, expect } from '../../fixtures';

/**
 * TC-S10 — Featured-trial guard.
 * The featuredTrial fixture navigates to the pinned featured trial and throws if
 * it lands on a /clinicaltrial/<id>/ microsite or the contact form is missing.
 * Here we assert the resulting page is the standard featured template.
 */
test('TC-S10 featured trial is a listings detail page with a contact form @smoke @regression', async ({
  featuredTrial,
  page,
}) => {
  // Standard featured template URL: /clinical-trials/listings/<id>/...
  expect(featuredTrial.url).toMatch(/\/clinical-trials\/listings\/\d+\//);
  // And it is NOT the microsite template.
  expect(featuredTrial.url).not.toMatch(/\/clinicaltrial\/\d+/);

  // The contact form exists on this template (may be inside the widget, so attached).
  await expect(page.locator('#contact-site-form')).toBeAttached();
});
