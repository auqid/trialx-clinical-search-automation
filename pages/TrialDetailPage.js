// @ts-check
const { BasePage } = require('./BasePage');

/**
 * Featured trial detail (/clinical-trials/listings/<id>/) — the standard template
 * that HAS the "connect with a site" step and contact widget. The /clinicaltrial/<id>/
 * microsite has none of this and must be guarded against (see the featuredTrial fixture).
 *
 * Selectors verified in the DOM audit (report.md):
 *  - step-one toggle  a.step-collapse[href="#step1"] (aria-label "Step one, connect with a site")
 *  - step-one region  #step1 (div.collapse.show — expanded by default)
 *  - heading          #contact-heading
 *  - site widget      #site-widget
 *  - contact form     #contact-site-form
 */
class TrialDetailPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.stepOneToggle = page.locator('a.step-collapse[href="#step1"]');
    this.stepOne = page.locator('#step1');
    this.contactHeading = page.locator('#contact-heading');
    this.siteWidget = page.locator('#site-widget');
    this.contactForm = page.locator('#contact-site-form');
  }

  /**
   * Ensure the "connect with a site" step is expanded. It ships expanded
   * (`collapse show`), so this is a no-op unless a build changes that default.
   */
  async expandContactStep() {
    const expanded = await this.stepOneToggle.getAttribute('aria-expanded');
    if (expanded === 'false') {
      await this.stepOneToggle.click();
    }
  }

  /**
   * Scroll the site widget into view and wait for it to be attached, so callers
   * can start driving the site-selection flow.
   */
  async reachContactWidget() {
    await this.expandContactStep();
    await this.siteWidget.scrollIntoViewIfNeeded();
    await this.siteWidget.waitFor({ state: 'attached' });
  }
}

module.exports = { TrialDetailPage };
