# TrialX Clinical-Trials — Front-End Test Automation

Automated front-end (E2E/UI) tests for the **TrialX clinical-trials search** and the
**study-contact "Send a message" form**, built with **Playwright + JavaScript**.

The suite drives the live dev site: landing search, autocomplete, results (sort /
filter / pagination / empty state), and the multi-step site-selection → contact-form
flow, across Chromium, Firefox, and WebKit.

## Prerequisites

- **Node.js** 18+ (CI uses the current LTS)
- Install dependencies and browsers:

```bash
npm install
npx playwright install        # add --with-deps on Linux/CI
```

## Setup

```bash
cp .env.example .env           # BASE_URL + timeouts; already points at the dev site
```

Everything environment-specific (base URL, timeouts) is read from `.env` — nothing
is hardcoded. Swap `BASE_URL` to retarget another environment.

## Running the tests

```bash
npm test                       # all tests, all browsers (headless)
npm run test:headed            # headed
npm run test:report            # open the last HTML report

# By tag
npx playwright test --grep @smoke
npx playwright test --grep @regression

# By browser
npx playwright test --project=chromium      # or firefox / webkit

# By area
npx playwright test tests/search
npx playwright test tests/contact
```

Lint / format:

```bash
npm run lint
npm run format
```

## Project structure

```
pages/          Page Object Model — locators + actions, no assertions
                (Landing, SearchResults, TrialDetail, SiteWidget, ContactForm)
fixtures/       index.js  — extends Playwright's test with page-object fixtures
                            + the guarded `featuredTrial` fixture
                testData.js — centralised, synthetic (non-PII) test data
tests/
  global-setup.js   accepts the OneTrust cookie banner once, saves storageState
  search/           TC-S* search specs
  contact/          TC-C* contact-form specs (+ helpers.js)
docs/           test-strategy.md, BUG_REPORT.md, and DOM/selector audit
.env(.example)  environment config (BASE_URL, timeouts)
playwright.config.js
```

## Design decisions

- **Page Object Model** keeps selectors and interactions in one place, so specs read
  as intent and DOM churn is absorbed by the page objects.
- **Cookie consent via `storageState`.** `global-setup.js` accepts the OneTrust
  banner once and saves the consented browser state to `.auth/consent.json`; every
  project reuses it, so the banner never intercepts clicks and each test skips the
  consent dance.
- **`featuredTrial` fixture guards the template.** Search returns two detail
  templates — featured trials at `/clinical-trials/listings/<id>/` (which have the
  contact form) and a `/clinicaltrial/<id>/` marketing microsite (which does not).
  The fixture navigates to a known featured trial and fails fast with a clear error
  if it ever lands on a microsite.
- **Workers are capped on CI** (`workers: 1` when `CI` is set) because the tests run
  against a **shared** dev server; high parallelism overwhelms it and causes
  navigation timeouts. Navigation/test timeouts are also generous for the same reason.
- **Validation is asserted via `.invalid-feedback`, not `:invalid`.** The contact
  form validates in client-side JS (Bootstrap `is-invalid` + `.invalid-feedback`
  messages) and does **not** use native HTML5 `required`, so tests assert on the
  rendered error messages.

## Known findings

Product/accessibility findings surfaced during testing are documented in
[docs/BUG_REPORT.md](docs/BUG_REPORT.md).
