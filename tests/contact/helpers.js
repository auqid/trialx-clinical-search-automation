// @ts-check

/**
 * Shared navigation helper for the contact specs (NOT a page object — it just
 * composes the existing page objects so every test doesn't repeat the flow).
 *
 * From a featured trial: expand the connect step, pick a study site in the
 * #site-widget, click Next, and wait for the #contact-site-form to render.
 * Returns the selected site's name so specs can assert it is shown.
 *
 * @param {{ trialDetailPage: any, siteWidgetPage: any, contactFormPage: any }} pages
 * @param {number} [siteIndex]
 * @returns {Promise<{ siteName: string }>}
 */
async function reachContactForm(
  { trialDetailPage, siteWidgetPage, contactFormPage },
  siteIndex = 0,
) {
  await trialDetailPage.reachContactWidget();

  const card = siteWidgetPage.siteCards.nth(siteIndex);
  await card.waitFor({ state: 'visible', timeout: 20_000 });
  const siteName = (await card.innerText())
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)[0];

  await card.click();
  await siteWidgetPage.next();
  await contactFormPage.firstNameInput.waitFor({ state: 'visible', timeout: 20_000 });

  return { siteName };
}

/**
 * Give each browser project a distinct study site for the tests that actually
 * SUBMIT (so parallel browsers don't contact the same site in one run). `offset`
 * lets a second submitting test (e.g. TC-C05 passing case) pick a different site
 * from TC-C02 within the same project. Kept within the first results page (0-4).
 *
 * @param {string} projectName
 * @param {number} [offset]
 */
function siteIndexForProject(projectName, offset = 0) {
  const base = { chromium: 0, firefox: 1, webkit: 2 }[projectName] ?? 0;
  return base + offset;
}

/**
 * A fresh, synthetic (non-PII) email for tests that actually submit. The dev
 * pipeline's "already-contacted" state is keyed on site + email, so reusing one
 * address makes repeated runs silently no-op. A unique address per submission
 * keeps the happy-path deterministic without touching any assertion.
 */
function uniqueEmail() {
  return `qa+${Date.now()}-${Math.floor(Math.random() * 1e4)}@example.com`;
}

module.exports = { reachContactForm, siteIndexForProject, uniqueEmail };
