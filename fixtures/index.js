// @ts-check
const base = require('@playwright/test');
const {
  LandingSearchPage,
  SearchResultsPage,
  TrialDetailPage,
  SiteWidgetPage,
  ContactFormPage,
} = require('../pages');
const testData = require('./testData');

/**
 * Extended Playwright test exposing ready-made page objects plus a guarded
 * `featuredTrial` fixture. No assertions live in page objects; the featuredTrial
 * guard is deliberately a hard failure because a wrong template (microsite) would
 * make every downstream contact spec fail confusingly.
 */
const test = base.test.extend({
  landingSearchPage: async ({ page }, use) => {
    await use(new LandingSearchPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  trialDetailPage: async ({ page }, use) => {
    await use(new TrialDetailPage(page));
  },
  siteWidgetPage: async ({ page }, use) => {
    await use(new SiteWidgetPage(page));
  },
  contactFormPage: async ({ page }, use) => {
    await use(new ContactFormPage(page));
  },

  /**
   * Navigate to the pinned FEATURED trial (standard template WITH the contact form)
   * and guard the template. Yields { url, path, trialDetail } to the test.
   *
   * Guard logic:
   *  1. Microsite URL guard — /clinicaltrial/<id>/ (note: NO hyphen, distinct from
   *     the featured /clinical-trials/listings/<id>/) has no contact form → throw.
   *  2. Structural guard — #contact-site-form must be attached on the page → throw
   *     with a clear message if it isn't.
   */
  featuredTrial: async ({ page, trialDetailPage }, use) => {
    const { path } = testData.featuredTrial;
    await page.goto(path, { waitUntil: 'domcontentloaded' });

    const url = page.url();
    if (/\/clinicaltrial\/\d+/.test(url)) {
      throw new Error(
        `featuredTrial landed on a microsite (${url}). Expected a ` +
          `/clinical-trials/listings/<id>/ featured trial with a contact form. ` +
          `Update FEATURED_TRIAL_PATH / testData.featuredTrial to a featured record.`,
      );
    }

    try {
      await page.locator('#contact-site-form').waitFor({ state: 'attached', timeout: 15_000 });
    } catch {
      throw new Error(
        `#contact-site-form was not found on ${url}. This is likely not a featured ` +
          `trial (the /clinicaltrial/<id>/ microsite has no contact form). ` +
          `Check testData.featuredTrial / FEATURED_TRIAL_PATH.`,
      );
    }

    await use({ url, path, trialDetail: trialDetailPage });
  },
});

const expect = base.expect;

module.exports = { test, expect, testData };
