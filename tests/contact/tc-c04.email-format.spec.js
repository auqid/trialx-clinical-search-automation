// @ts-check
import { test, expect, testData } from '../../fixtures';
import { reachContactForm } from './helpers';

/**
 * TC-C04 — Email-format matrix (data-driven).
 * Each malformed email is blocked with an "Invalid email address" message and no
 * success screen. Other fields are valid and both consents checked, so email is
 * the only thing under test.
 */
test.describe('TC-C04 email-format validation @smoke @regression', () => {
  for (const badEmail of testData.emails.invalid) {
    test(`TC-C04 invalid email ${JSON.stringify(badEmail)} is blocked`, async ({
      featuredTrial,
      trialDetailPage,
      siteWidgetPage,
      contactFormPage,
    }) => {
      void featuredTrial;

      await reachContactForm({ trialDetailPage, siteWidgetPage, contactFormPage });

      await contactFormPage.fillForm({ ...testData.validContact, email: badEmail });
      await contactFormPage.setConsents({ age: true, terms: true });
      await contactFormPage.submit();

      await expect(contactFormPage.successScreen).toBeHidden();
      await expect(
        contactFormPage.validationMessages
          .filter({ visible: true, hasText: /invalid email address/i })
          .first(),
      ).toBeVisible();
    });
  }
});
