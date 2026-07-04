// @ts-check

/**
 * Centralised, synthetic (non-PII) test data pulled from the strategy doc
 * (test-strategy.md, Section 5) and the DOM audit (report.md). The next commit's
 * data-driven specs import from here so values live in one place.
 */

/** Search terms and probes. */
const searchTerms = {
  valid: 'asthma', // known to return multiple pages of results
  autocompleteBelowMin: 'as', // 2 chars — dropdown stays hidden
  autocompleteAtMin: 'ast', // 3 chars — dropdown appears (min threshold = 3)
  noResults: 'zzxqwventyfake123', // yields the empty state
  // Reflected-input probes: the query is echoed in the no-results message and
  // MUST be rendered escaped (see TC-S07 in the strategy).
  reflectedProbes: ['<b>x</b>', '"><img src=x>'],
};

/** Email partition — valid vs malformed (drives the email-format matrix). */
const emails = {
  valid: ['qa+test@example.com', 'jane.doe@example.org'],
  invalid: ['notanemail', 'a@', 'a@b', 'a b@c.com'],
};

/**
 * Name field boundaries. firstname/lastname/other cap at maxlength=30, so the
 * 31-char value should be truncated to 30 by the browser.
 */
const names = {
  valid: 'Jane',
  atMaxLength: 'A'.repeat(30),
  overMaxLength: 'A'.repeat(31),
  maxLength: 30,
};

/** Email maxlength boundary (email caps at 150). */
const emailLimits = {
  maxLength: 150,
  atMaxLength: `${'a'.repeat(64)}@${'b'.repeat(80)}.com`.slice(0, 150),
  overMaxLength: `${'a'.repeat(150)}@example.com`,
};

/** Phone values (intl-tel-input, +1 default). */
const phones = {
  valid: '2015550123', // reserved 555 range — synthetic
  invalidShort: '123',
  nonNumeric: 'abcdef',
};

/**
 * Consent combinations for #age_consent_checkbox + #cw-terms-conditions.
 * Only the both-checked case should allow submission.
 */
const consentCombos = [
  { age: false, terms: false, shouldPass: false },
  { age: true, terms: false, shouldPass: false },
  { age: false, terms: true, shouldPass: false },
  { age: true, terms: true, shouldPass: true },
];

/** A complete, valid synthetic applicant for the happy-path submission. */
const validContact = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'qa+test@example.com',
  phone: '2015550123',
};

/**
 * Known-good FEATURED trial (standard template WITH the contact form). Overridable
 * via env so the pinned dev record can be swapped without code changes.
 * The featuredTrial fixture guards that this really is a /clinical-trials/listings/<id>/
 * page and not a /clinicaltrial/<id>/ microsite.
 */
const featuredTrial = {
  id: Number(process.env.FEATURED_TRIAL_ID) || 13294,
  path: process.env.FEATURED_TRIAL_PATH || '/clinical-trials/listings/13294/autorun1192/',
};

/** A microsite record (NO contact form) — used by guard/negative coverage. */
const micrositeTrial = {
  id: 13761,
  path: '/clinicaltrial/13761/test_release_v6141-do-not-make/',
};

module.exports = {
  searchTerms,
  emails,
  names,
  emailLimits,
  phones,
  consentCombos,
  validContact,
  featuredTrial,
  micrositeTrial,
};
