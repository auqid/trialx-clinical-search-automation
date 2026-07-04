// @ts-check

/**
 * Shared behaviour for all page objects. Holds the Playwright `page` and a few
 * navigation/wait helpers. No assertions live in page objects — specs assert.
 */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a path relative to the configured `baseURL` (or an absolute URL).
   * @param {string} [path]
   */
  async goto(path = '') {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Wait until the DOM content is loaded. */
  async waitForLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

module.exports = { BasePage };
