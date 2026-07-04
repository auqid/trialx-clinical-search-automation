// @ts-check
const { BasePage } = require('./BasePage');

/**
 * The MUI "Find a Site" widget (#site-widget / #id_site_locator_widget) — the
 * first step of the contact flow: choose a study site, then Next → contact form.
 *
 * The widget is a React/MUI app whose classes are hashed (`jss*`), so this object
 * is driven entirely by ARIA role/name + the stable #site-widget container:
 *  - each site card is a `button` that contains a `radio` (its accessible name is
 *    the site name + location);
 *  - Next/Back are buttons (both steps reuse the "Next" label, so we filter to the
 *    single visible one).
 */
class SiteWidgetPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.root = page.locator('#site-widget');

    // Site cards = buttons containing a radio; the radios themselves for state checks.
    this.siteCards = this.root.getByRole('button').filter({ has: page.getByRole('radio') });
    this.siteRadios = this.root.getByRole('radio');

    // View toggle.
    this.viewBothButton = this.root.getByRole('button', { name: 'Both' });
    this.viewListButton = this.root.getByRole('button', { name: 'List' });
    this.viewMapButton = this.root.getByRole('button', { name: 'Map' });

    // Location filter inside the widget.
    this.locationInput = this.root.getByPlaceholder(/address/i);

    // Step navigation — both steps expose a "Next"; keep only the visible one.
    this.nextButton = this.root.getByRole('button', { name: 'Next' }).filter({ visible: true });
    this.backButton = this.root.getByRole('button', { name: 'Back' }).filter({ visible: true });
  }

  /**
   * Select a study site by index (0-based). Clicking the card checks its radio.
   * @param {number} [index]
   */
  async selectSite(index = 0) {
    await this.siteCards.nth(index).click();
  }

  /** Advance to the contact form step. */
  async next() {
    await this.nextButton.click();
  }

  /** Go back to site selection. */
  async back() {
    await this.backButton.click();
  }

  /**
   * Switch the site list/map view.
   * @param {'both'|'list'|'map'} view
   */
  async setView(view) {
    const map = { both: this.viewBothButton, list: this.viewListButton, map: this.viewMapButton };
    await map[view].click();
  }
}

module.exports = { SiteWidgetPage };
