// @ts-check
import { test, expect, testData } from '../../fixtures';
import { reachContactForm, siteIndexForProject, uniqueEmail } from './helpers';

/**
 * TC-C05 — Consent matrix (data-driven).
 * Submission is blocked unless BOTH #age_consent_checkbox and #cw-terms-conditions
 * are checked. Split into failing/passing groups (from each combo's shouldPass) so
 * there is no conditional assertion inside a test.
 */
const failingCombos = testData.consentCombos.filter((combo) => !combo.shouldPass);
const passingCombos = testData.consentCombos.filter((combo) => combo.shouldPass);

test.describe('TC-C05 consent enforcement @smoke @regression', () => {
  for (const combo of failingCombos) {
    test(`TC-C05 consent age=${combo.age} terms=${combo.terms} blocks submission`, async ({
      featuredTrial,
      trialDetailPage,
      siteWidgetPage,
      contactFormPage,
    }) => {
      void featuredTrial;

      await reachContactForm({ trialDetailPage, siteWidgetPage, contactFormPage });

      await contactFormPage.fillForm(testData.validContact);
      await contactFormPage.setConsents({ age: combo.age, terms: combo.terms });
      await contactFormPage.submit();

      // Missing at least one consent → blocked: form stays, no success screen.
      await expect(contactFormPage.successScreen).toBeHidden();
      await expect(contactFormPage.form).toBeVisible();
    });
  }

  for (const combo of passingCombos) {
    test(`TC-C05 consent age=${combo.age} terms=${combo.terms} allows submission`, async ({
      featuredTrial,
      trialDetailPage,
      siteWidgetPage,
      contactFormPage,
    }, testInfo) => {
      void featuredTrial;

      // Distinct site from TC-C02 to avoid re-contacting the same site in a run.
      await reachContactForm(
        { trialDetailPage, siteWidgetPage, contactFormPage },
        siteIndexForProject(testInfo.project.name, 2),
      );

      // Fresh email per run so the site+email "already-contacted" state doesn't no-op.
      await contactFormPage.fillForm({ ...testData.validContact, email: uniqueEmail() });
      await contactFormPage.setConsents({ age: combo.age, terms: combo.terms });
      await contactFormPage.submit();

      await expect(contactFormPage.successScreen).toBeVisible({ timeout: 30_000 });
    });
  }
});
