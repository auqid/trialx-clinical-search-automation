// @ts-check
const { BasePage } = require('./BasePage');

/**
 * Search results (/clinical-trials/listings/search/?q=...).
 * Selectors verified in the DOM audit (report.md):
 *  - result cards     .result-item            (10 per page)
 *  - result links     .search-item--link
 *  - sort             select[name="sort_by"]  (relevance|distance|last_updated|most_viewed)
 *  - radius           #location-radius-dropdown (name="radius": 10|25|50|100|250|11000)
 *  - pagination       .pagination .page-link
 *  - loader           #trialsLoader
 *  - no-results copy   "No clinical trials found for '<query>'." (no dedicated id/class —
 *                      matched by text; see flagged notes)
 */
class SearchResultsPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.resultItems = page.locator('.result-item');
    this.resultLinks = page.locator('.search-item--link');
    this.sortSelect = page.locator('select[name="sort_by"]');
    this.radiusSelect = page.locator('#location-radius-dropdown');
    this.pageLinks = page.locator('.pagination .page-link');
    this.loader = page.locator('#trialsLoader');
    this.noResultsMessage = page.getByText(/no clinical trials found/i);
  }

  /** Wait for the results loader to finish. */
  async waitForResults() {
    await this.loader.waitFor({ state: 'hidden' }).catch(() => {});
  }

  /** @param {string} value - one of relevance|distance|last_updated|most_viewed */
  async sortBy(value) {
    await this.sortSelect.selectOption(value);
    await this.waitForResults();
  }

  /** @param {string} value - radius option value, e.g. "10", "50", "11000" */
  async setRadius(value) {
    await this.radiusSelect.selectOption(value);
    await this.waitForResults();
  }

  /**
   * Click a pagination control by its visible label (e.g. "2", "→").
   * @param {string} label
   */
  async goToPage(label) {
    await this.pageLinks
      .filter({ hasText: new RegExp(`^\\s*${label}\\s*$`) })
      .first()
      .click();
    await this.waitForResults();
  }

  /**
   * Open a result by index (0-based). Returns the href navigated to.
   * @param {number} [index]
   */
  async openResult(index = 0) {
    const link = this.resultLinks.nth(index);
    const href = await link.getAttribute('href');
    await link.click();
    return href;
  }
}

module.exports = { SearchResultsPage };
