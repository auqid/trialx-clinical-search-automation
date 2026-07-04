// @ts-check
const { BasePage } = require('./BasePage');

/**
 * Landing search (/clinical-trials/listings/).
 * Selectors verified in the DOM audit (report.md):
 *  - condition input  #search-medical-conditions (name="q", min 3 chars for autocomplete)
 *  - location input   #search-study-location   (name="place", Google Places)
 *  - autocomplete     .bootstrap-autocomplete.dropdown-menu > a.dropdown-item
 *  - the search <form> posts (GET) to /clinical-trials/listings/search/
 */
class LandingSearchPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);
    this.path = '/clinical-trials/listings/';

    this.conditionInput = page.locator('#search-medical-conditions');
    this.locationInput = page.locator('#search-study-location');
    this.autocompleteDropdown = page.locator('.bootstrap-autocomplete.dropdown-menu');
    this.autocompleteOptions = this.autocompleteDropdown.locator('a.dropdown-item');
    // Verified button label from the audit: "Submit to find trials".
    this.submitButton = page.getByRole('button', { name: /find trials/i });
  }

  /** Open the landing page. */
  async open() {
    await this.goto(this.path);
  }

  /**
   * Type a condition/keyword. Uses real key presses so the autocomplete
   * (which needs 3+ chars) fires.
   * @param {string} term
   */
  async typeCondition(term) {
    await this.conditionInput.click();
    await this.conditionInput.fill('');
    await this.conditionInput.pressSequentially(term);
  }

  /** @param {string} place */
  async typeLocation(place) {
    await this.locationInput.click();
    await this.locationInput.pressSequentially(place);
  }

  /**
   * Click an autocomplete suggestion by its visible text.
   * @param {string} name
   */
  async selectAutocompleteOption(name) {
    await this.autocompleteOptions.filter({ hasText: name }).first().click();
  }

  /** Submit the search form. */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Convenience: type a term and submit (does not touch the autocomplete).
   * @param {string} term
   */
  async searchFor(term) {
    await this.typeCondition(term);
    await this.submit();
  }
}

module.exports = { LandingSearchPage };
