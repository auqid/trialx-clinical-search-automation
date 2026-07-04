// @ts-check
import { test, expect, testData } from '../../fixtures';
import { reachContactForm } from './helpers';

/**
 * TC-C03 — Required-field matrix (data-driven).
 * For each required field, submit with only that field empty (others valid,
 * consents checked); submission is blocked and a "Required" message shows.
 * Validation is client-side JS, so we assert on .invalid-feedback — NOT :invalid.
 */
const requiredFields = [
  { name: 'firstname', input: (cf) => cf.firstNameInput },
  { name: 'lastname', input: (cf) => cf.lastNameInput },
  { name: 'email', input: (cf) => cf.emailInput },
  { name: 'phone', input: (cf) => cf.phoneInput },
];

test.describe('TC-C03 required-field validation @smoke @regression', () => {
  for (const field of requiredFields) {
    test(`TC-C03 "${field.name}" empty is blocked with a Required message`, async ({
      featuredTrial,
      trialDetailPage,
      siteWidgetPage,
      contactFormPage,
    }) => {
      void featuredTrial;

      await reachContactForm({ trialDetailPage, siteWidgetPage, contactFormPage });

      // Fill everything valid, then empty only the field under test.
      await contactFormPage.fillForm(testData.validContact);
      await field.input(contactFormPage).fill('');
      await contactFormPage.setConsents({ age: true, terms: true });
      await contactFormPage.submit();

      // Blocked: no success screen…
      await expect(contactFormPage.successScreen).toBeHidden();
      // …and a visible "Required" message is shown (only this field is empty).
      await expect(
        contactFormPage.validationMessages.filter({ visible: true, hasText: /required/i }).first(),
      ).toBeVisible();
    });
  }
});
