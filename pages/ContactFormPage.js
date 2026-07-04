// @ts-check
const { BasePage } = require('./BasePage');

/**
 * The "Send a message" contact form — the step reached after selecting a site.
 * Selectors verified in the DOM audit (report.md). All fields are required and
 * validated client-side (Bootstrap `is-invalid` + `.invalid-feedback`); there is
 * NO HTML5 `required`. Success screen (#contact-site-success) is injected only
 * after a successful submit.
 *
 *  - form            #contact-site-form
 *  - first/last/email  input[name="firstname"|"lastname"|"email"] (max 30/30/150)
 *  - phone           #phone-no (intl-tel-input, +1 default)
 *  - consents        #age_consent_checkbox, #cw-terms-conditions (Bootstrap custom controls)
 *  - submit          the visible primary CTA (labelled "Next") within the step
 *  - success         #contact-site-success (.fas-success-screen) + #success-message-tab
 */
class ContactFormPage extends BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    super(page);

    this.form = page.locator('#contact-site-form');
    this.firstNameInput = this.form.locator('input[name="firstname"]');
    this.lastNameInput = this.form.locator('input[name="lastname"]');
    this.emailInput = this.form.locator('input[name="email"]');
    this.phoneInput = page.locator('#phone-no');
    this.ageConsentCheckbox = page.locator('#age_consent_checkbox');
    this.termsConsentCheckbox = page.locator('#cw-terms-conditions');

    // Submit is the visible primary CTA of the connect step (labelled "Next",
    // or "Send" if a build renames it). Scoped to #step1 and filtered to visible
    // so it doesn't collide with the site-selection step's "Next".
    this.submitButton = page
      .locator('#step1')
      .getByRole('button', { name: /next|send/i })
      .filter({ visible: true });

    // Inline validation surfaces (no assertions here — exposed for specs to read).
    this.invalidFields = this.form.locator('.is-invalid');
    this.validationMessages = this.form.locator('.invalid-feedback');

    // Post-submit success screen (dynamic — only present after a successful send).
    this.successScreen = page.locator('#contact-site-success');
    this.successMessage = page.locator('.fas-success-message');
    this.submittedTab = page.locator('#success-message-tab');
  }

  /**
   * Fill the provided text fields (only keys present are typed).
   * @param {{ firstName?: string, lastName?: string, email?: string, phone?: string }} data
   */
  async fill({ firstName, lastName, email, phone } = {}) {
    if (firstName !== undefined) await this.firstNameInput.fill(firstName);
    if (lastName !== undefined) await this.lastNameInput.fill(lastName);
    if (email !== undefined) await this.emailInput.fill(email);
    if (phone !== undefined) await this.phoneInput.fill(phone);
  }

  /**
   * Set the two consent checkboxes. These are Bootstrap custom-control inputs
   * (visually hidden), so we set them with `force` to bypass the styled overlay.
   * @param {{ age?: boolean, terms?: boolean }} consents
   */
  async setConsents({ age = false, terms = false } = {}) {
    await this.ageConsentCheckbox.setChecked(age, { force: true });
    await this.termsConsentCheckbox.setChecked(terms, { force: true });
  }

  /** Submit the contact form. */
  async submit() {
    await this.submitButton.click();
  }
}

module.exports = { ContactFormPage };
