// @ts-check
import { test, expect, testData } from '../../fixtures';
import { reachContactForm, siteIndexForProject, uniqueEmail } from './helpers';

/**
 * TC-C02 — Happy-path submission.
 * Fill valid synthetic data, check both consents, submit; the success screen
 * appears and the tab switches to "Submitted".
 *
 * NOTE: this test REALLY submits to the dev pipeline. It uses synthetic, non-PII
 * data only, and a per-project site to avoid the three browsers contacting the
 * same site in one run. Repeated runs may still trip the "already-contacted"
 * state for a site — if this starts failing on the success assertion, check
 * whether the selected site shows an already-contacted screen rather than the
 * form (that is an environment/data condition, not a product defect).
 */
test('TC-C02 valid submission shows the success screen @smoke @regression', async ({
  featuredTrial,
  trialDetailPage,
  siteWidgetPage,
  contactFormPage,
}, testInfo) => {
  void featuredTrial;

  await reachContactForm(
    { trialDetailPage, siteWidgetPage, contactFormPage },
    siteIndexForProject(testInfo.project.name),
  );

  // Fresh email per run so the site+email "already-contacted" state doesn't no-op.
  await contactFormPage.fillForm({ ...testData.validContact, email: uniqueEmail() });
  await contactFormPage.setConsents({ age: true, terms: true });
  await contactFormPage.submit();

  await expect(contactFormPage.successScreen).toBeVisible({ timeout: 30_000 });
  await expect(contactFormPage.submittedTab).toBeVisible();
});
