# Front-End Test Strategy — TrialX Clinical Trials

**Features under test:** (1) Trial Search &nbsp; (2) Study-Contact "Send a message" form
**Application:** TrialX Connect — Clinical Trials listings
**Environment (test):** `https://dev-connect.ainfo.io/clinical-trials/listings/`
**Author:** QA / Front-End Automation
**Date:** 2026-07-04
**Status:** Baseline — selectors, constraints, and validation behaviour verified against the live DOM via Playwright.

---

## 1. Objective

Provide a repeatable, industry-standard front-end test strategy that verifies the **trial search** experience (landing search, results, filtering, sorting, pagination, empty state) and the **study-contact "Send a message"** flow (site selection → contact form → validation → submission confirmation) function correctly, are resilient to invalid input, and behave consistently across the supported browser matrix.

The strategy is written to be directly actionable for both **manual verification** and **UI automation** (Playwright), and pins the concrete, DOM-verified selectors and constraints the automation must assert against.

---

## 2. Scope

### 2.1 In scope
- **Landing search**: condition/keyword field (`#search-medical-conditions`), location field (`#search-study-location`), condition autocomplete, form submission and URL contract.
- **Results page**: rendering of result cards, sort control, location + radius filter, advanced filters, facets, pagination, and the no-results empty state.
- **Study-contact flow** on a **featured** trial (`/clinical-trials/listings/<id>/`): the multi-step "Find a Site" widget → site selection → "Send a message" contact form → client-side validation → success confirmation.
- Client-side field constraints (required, `maxlength`, email format, phone), consent checkbox enforcement, and post-submission state.
- Cross-browser rendering/behaviour and basic responsive checks.
- Accessibility smoke checks on the two features (labels, keyboard, focus).

### 2.2 Out of scope
- The `/clinicaltrial/<id>/` **microsite** template (marketing "study website" with prescreener) — different template, no standard contact form. Explicitly excluded; automation must not land on these.
- Back-end / API correctness of search ranking, geo-resolution, and message delivery to sites (covered by API/integration suites, not front-end).
- Google Maps / Google Places third-party internals (only our integration points are tested).
- OneTrust cookie-consent product internals (we only assert accept/dismiss behaviour).
- Load, performance, penetration, and formal security testing (separate specialised efforts). Reflected-input handling is included only as a smoke-level UI check.
- Email/SMS deliverability and CRM ingestion.

---

## 3. Test Approach & Levels

### 3.1 Levels
| Level | Focus | Owner |
|---|---|---|
| Component / UI unit | Individual widgets (autocomplete, radius select, consent checkboxes) behave per spec | Dev + QA |
| Integration (front-end) | Search form → results URL contract; site selection → contact form → success screen | QA automation |
| System / E2E | Full journey: landing → search "asthma" → open featured trial → select site → send message → confirmation | QA automation |
| Cross-browser / responsive | Rendering + interaction across the browser matrix and breakpoints | QA |
| Accessibility smoke | Labels, keyboard operability, focus order, error announcement | QA |

### 3.2 Techniques
- **Equivalence partitioning & boundary-value analysis** for input fields (e.g. `maxlength` 30/150 boundaries, autocomplete min-length threshold = 3).
- **Data-driven testing** to fold input-only variations (valid/invalid email, required-field permutations) into single parameterised cases rather than one case per value.
- **State-transition testing** for the multi-step site widget (select → next → validate → submit → success / already-contacted).
- **Negative & error-guessing** for validation, reflected input, and template-routing edge cases.

### 3.3 Key DOM-verified facts the automation relies on
- **Landing search form**: `action="/clinical-trials/listings/search/"`, **GET**; submits `q`, `place`, and hidden `geo_lat`, `geo_lng`, `user_country`. Both visible fields are **optional** (no HTML5 `required`); `autocomplete="off"`.
- **Condition autocomplete**: bootstrap-autocomplete dropdown (`.bootstrap-autocomplete.dropdown-menu` → `a.dropdown-item`); **minimum 3 characters** before suggestions appear (hidden at 1–2). Note `#search_medical_list` is the *browse-by-condition* list, **not** the autocomplete.
- **Results sort** (`select[name="sort_by"]`): `relevance`, `distance`, `last_updated`, `most_viewed`.
- **Radius** (`#location-radius-dropdown`, `name="radius"`): `10, 25, 50, 100, 250, 11000` (Entire World).
- **Results paging**: 10 `.result-item` cards per page; `.pagination .page-link` controls.
- **No-results state**: renders `No clinical trials found for '<query>'.` with the query echoed back.
- **Contact form** lives inside a **multi-step MUI "Find a Site" widget** (`#site-widget` / `#id_site_locator_widget`): *Select a site* (list/map/both, radius, pagination) → **Next** → *Send a message* (`#contact-site-form`) → submit → `#contact-site-success` (`.fas-success-screen`); the site tab switches to **"Submitted"** (`#success-message-tab`).
- **Contact fields** (all marked `*`, all required, JS-validated — **no** HTML5 `required`):
  | Field | Selector | Type | maxlength |
  |---|---|---|---|
  | First name | `input[name="firstname"]` | text | 30 |
  | Last name | `input[name="lastname"]` | text | 30 |
  | Email | `input[name="email"]` | email | 150 |
  | Phone | `#phone-no` (`name="phone-no"`) | tel (intl-tel-input, `+1` default) | — |
  | Age consent | `#age_consent_checkbox` | checkbox (required) | — |
  | Terms consent | `#cw-terms-conditions` | checkbox (required) | — |
- **Validation is client-side JS** using Bootstrap `is-invalid` + `.invalid-feedback`. Verified messages: empty field → **"Required"**; malformed email → **"Invalid email address"**. Invalid submit is blocked (stays on the form; no success screen).
- **Site-slot caps** exist as widget messages: *"You can select a maximum of 2 slots per day."* and *"You can select up to 5 slots…"* (surfaced when the limit is hit).

---

## 4. Automation Approach

- **Tool:** Playwright (already scaffolded in this repo), TypeScript, Page Object Model.
- **Structure:** Page objects for `LandingSearch`, `SearchResults`, `TrialDetail`, `SiteWidget`, `ContactForm`; fixtures for cookie-consent handling and featured-trial navigation.
- **Cookie consent:** A global setup / fixture accepts OneTrust **once** (`#onetrust-accept-btn-handler`) and persists storage state, so the banner never intercepts later clicks. All specs reuse the saved storage state.
- **Selector policy:** Prefer stable IDs/names verified here (`#search-medical-conditions`, `select[name="sort_by"]`, `#contact-site-form`, etc.). Avoid MUI hashed classes (`jss*`) — drive the site widget by **role/name** (e.g. `getByRole('button', { name: 'Next' })`, site cards by accessible name).
- **Waiting:** Use web-first assertions / `waitFor` on results (`.result-item`) and on `#trialsLoader` disappearing; never fixed sleeps.
- **Data-driven:** Use Playwright parameterised specs for the email-format matrix and the required-field matrix.
- **Featured-trial guard:** Helper asserts the detail URL matches `/clinical-trials/listings/<id>/` and that `#contact-site-form` exists; fail fast if redirected to a `/clinicaltrial/<id>/` microsite.
- **Isolation:** Because "already contacted" state persists per site/trial, each contact-submission E2E uses a fresh trial/site or a dedicated test trial to avoid the "already-contacted" branch masking the form.
- **Reporting:** HTML report + traces/screenshots/video on failure; run in CI on the browser matrix.

---

## 5. Test Data Strategy

| Data set | Values | Purpose |
|---|---|---|
| Condition search terms | `asthma` (known hits), `as`/`ast` (autocomplete boundary 2 vs 3), `zzxqwventyfake123` (no results) | Search happy path, autocomplete threshold, empty state |
| Reflected-input probe | `<b>x</b>`, `"><img src=x>` | Confirm query echo is escaped in the no-results message |
| Names | Valid: `Jane`, 30-char string; Boundary: 30 vs 31 chars (expect truncation at 30) | maxlength boundary |
| Email | Valid: `qa+test@example.com`; Invalid: `notanemail`, `a@`, `a@b`, `a b@c.com`; 150-char boundary | Email format + maxlength |
| Phone | Valid US `2015550123`; invalid `123`; non-numeric | Phone/intl-tel validation |
| Consent | Both unchecked / one checked / both checked | Consent enforcement |
| Location | A real city (e.g. `New York`) via Places autocomplete; empty | Radius + distance sort |

- Use **synthetic, non-PII** data only (`example.com`, `+1 555…` reserved ranges).
- Prefer **known test trials** on the featured template (e.g. TX13294 *AutoRun1192*, which exposes multiple selectable sites) for site-widget flows.
- Never submit real contact details to live sites; treat the dev environment's message pipeline as observable only through the UI success screen.

---

## 6. Environment & Browser Matrix

**Environment:** DEV (`dev-connect.ainfo.io`). Pre-req: cookie consent accepted & stored; Google Maps/Places reachable.

| Browser | Versions | Priority | Notes |
|---|---|---|---|
| Chromium (Chrome/Edge) | Latest + latest-1 | P1 | Primary automation target |
| Firefox | Latest | P2 | Cross-engine |
| WebKit (Safari) | Latest | P2 | Safari parity, intl-tel + Maps quirks |
| Mobile Chrome (Pixel) | Emulated | P2 | Responsive, map/list toggle, touch |
| Mobile Safari (iPhone) | Emulated | P3 | iOS input/keyboard behaviour |

**Breakpoints:** mobile (≤576px), tablet (768px), desktop (≥1200px). Verify the site widget's List/Map/Both toggle and the contact form layout at each.

---

## 7. Risks & Mitigations

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Two detail templates; `/clinicaltrial/<id>/` microsite has **no** contact form | Tests target wrong page, false failures | URL guard + assert `#contact-site-form` before contact steps |
| R2 | MUI hashed classes (`jss*`) are unstable | Flaky selectors | Drive widget by ARIA role/name; add stable `data-testid` (dev ask) |
| R3 | "Already contacted" state persists per site/trial | Contact form hidden → false failure | Fresh trial/site per run; detect `#already-contacted-site` |
| R4 | Google Maps/Places third-party latency or quota | Flaky site widget & location autocomplete | Web-first waits, retries, mock/stub Places where feasible |
| R5 | Validation is JS-only (no HTML5 `required`) | Native-constraint assumptions fail | Assert on `is-invalid` / `.invalid-feedback` text, not `:invalid` |
| R6 | Cookie banner intercepts clicks | Click failures mid-flow | Accept once in global setup, persist storage state |
| R7 | Slot caps (2/day, 5 total) enforced app-side | Hard to reproduce deterministically | Dedicated data; treat as targeted, low-frequency case |
| R8 | Query is reflected in the empty-state message | Potential XSS if unescaped | Reflected-input smoke case (TC-S07) |
| R9 | Dev data is volatile (test trials renamed/removed) | Broken fixtures | Pin resilient search terms; centralise trial IDs in fixtures |

---

## 8. Entry & Exit Criteria

### 8.1 Entry
- DEV build deployed and reachable; search index populated (asthma returns ≥1 page).
- At least one featured trial with ≥1 selectable site available.
- Cookie-consent storage state generated; Playwright suite green on smoke.
- Test data (Section 5) and this strategy reviewed.

### 8.2 Exit
- 100% of **P1** cases executed; **0** open P1 defects.
- ≥95% of P2 cases executed; no open Critical/High defects.
- All required-field and email-format data-driven variants pass.
- Full happy-path E2E (search → featured trial → site select → send message → `#contact-site-success`) passes on all P1 browsers.
- Known issues documented with severity and workaround; results signed off.

---

## 9. Test Cases

Priority: **P1** critical · **P2** high · **P3** medium.
Type: Functional (F), Validation (V), UI/Responsive (UI), Accessibility (A11y), Negative (N), Security-smoke (Sec).

### 9.1 Trial Search

| ID | Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result |
|---|---|---|---|---|---|---|---|
| TC-S01 | Landing → results happy path & URL contract | F | P1 | Cookie accepted; on landing page | `q=asthma` | 1. Type `asthma` in `#search-medical-conditions` 2. Submit "Find trials" | Navigates to `/clinical-trials/listings/search/?q=asthma&place=&geo_lat=&geo_lng=&user_country=`; results grid renders; title reflects `asthma`; ≥1 `.result-item` shown |
| TC-S02 | Condition autocomplete min-length threshold | F | P1 | On landing page | `a`, `as`, `ast` | 1. Type 1 char, wait 2. Type 2nd char, wait 3. Type 3rd char, wait | Dropdown hidden at 1 & 2 chars; `.bootstrap-autocomplete.dropdown-menu.show` with `a.dropdown-item` suggestions appears at exactly 3 chars |
| TC-S03 | Select an autocomplete suggestion drives the search | F | P2 | On landing page | `asth` → "Asthma" | 1. Type `asth` 2. Click the "Asthma" suggestion 3. Submit | Field populated from suggestion; results page shows asthma trials |
| TC-S04 | Empty search submission | N | P2 | On landing page | none | 1. Leave both fields blank 2. Submit | Form submits (fields optional); app returns default/all-listings or a graceful prompt — no JS error, no blank crash |
| TC-S05 | Sort control changes result ordering | F | P1 | On results page for `asthma` | `relevance, distance, last_updated, most_viewed` (data-driven) | 1. For each option, select it in `select[name="sort_by"]` 2. Await reload | Results reload without error for each; `distance` requires a location and orders by proximity when one is set |
| TC-S06 | Location + radius filter | F | P2 | On results page | `place=New York`, radius ∈ {10, 50, Entire World} | 1. Enter location via Places autocomplete 2. Choose radius in `#location-radius-dropdown` 3. Apply | `radius` reflected in URL/query; result set updates consistently with the chosen radius |
| TC-S07 | No-results empty state + reflected-input escaping | N / Sec | P1 | On results page | `q=zzxqwventyfake123`; probe `q=<b>x</b>` | 1. Search a gibberish term 2. Search the HTML probe | Shows `No clinical trials found for '<query>'.` with 0 cards; probe is rendered **escaped** (no tag executed / injected) |
| TC-S08 | Pagination navigation | F | P2 | Results with >1 page (e.g. `asthma`) | pages 1→2, next/prev | 1. Note 10 cards on page 1 2. Click page 2 / `→` 3. Click `←`/page 1 | Each page shows up to 10 `.result-item`; active page indicated; `#trialsLoader` shows then clears; content changes per page |
| TC-S09 | Advanced filters & facets apply/reset | F | P2 | On results page | Gender / condition facet | 1. Open `#advanced-filter-modal` 2. Select a facet 3. `#apply-advanced-filters` 4. `#clear-all-facets` / `#reset-advanced-filters` | Facet narrows results; `#clear-all-facets` becomes visible when active and clears back to full set |
| TC-S10 | Open a FEATURED result (template guard) | F | P1 | On results page for `asthma` | featured trial (`/clinical-trials/listings/<id>/`) | 1. Open a featured `.search-item--link` 2. Assert URL + form presence | Lands on `/clinical-trials/listings/<id>/`; standard detail renders; `#contact-site-form` exists. (Microsite `/clinicaltrial/<id>/` must be skipped by the fixture) |
| TC-S11 | Results responsive rendering | UI | P3 | Results page | mobile/tablet/desktop | 1. Load results at each breakpoint | Cards, sort, filter controls reflow without overlap/clipping; no horizontal scroll |
| TC-S12 | Search accessibility smoke | A11y | P3 | Landing + results | keyboard only | 1. Tab to condition field 2. Operate autocomplete via keyboard 3. Submit | Fields have labels; autocomplete options reachable/selectable by keyboard; visible focus; results announced |

### 9.2 Study-Contact "Send a message" Form

| ID | Title | Type | Priority | Preconditions | Test Data | Steps | Expected Result |
|---|---|---|---|---|---|---|---|
| TC-C01 | Reach contact form via site selection | F | P1 | On a featured trial with ≥1 site; step 1 expanded | site = first available | 1. In `#site-widget`, select a site 2. Click **Next** | "Send a message" form (`#contact-site-form`) renders with First/Last/Email/Phone + two consent checkboxes; selected site shown |
| TC-C02 | Successful submission (happy path) | F | P1 | On contact form; fresh (not already-contacted) site | valid name/email/phone; both consents checked | 1. Fill all fields validly 2. Check both consents 3. Submit | `#contact-site-success` (`.fas-success-screen`) shows "Message sent successfully."; site tab switches to **"Submitted"**; no error |
| TC-C03 | Required-field validation (data-driven) | V | P1 | On contact form | Omit each of firstname/lastname/email/phone in turn; also all-empty | 1. Submit with the target field(s) empty | Submission blocked (form persists, no success); each empty required field flagged `is-invalid` with inline **"Required"** |
| TC-C04 | Email format validation (data-driven) | V | P1 | On contact form; other fields valid, consents checked | `notanemail`, `a@`, `a@b`, `a b@c.com` | 1. Enter each invalid email 2. Submit | Blocked each time; email shows inline **"Invalid email address"**; no success screen |
| TC-C05 | Consent checkboxes are mandatory | V | P1 | On contact form; all text fields valid | consents: both-unchecked / age-only / terms-only | 1. For each combo, submit | Submission blocked unless **both** `#age_consent_checkbox` and `#cw-terms-conditions` are checked; appropriate error/blocked state shown |
| TC-C06 | Text-field maxlength boundaries | V | P2 | On contact form | firstname/lastname 30 vs 31; email 150 vs 151 | 1. Enter boundary-length values | Input caps at `maxlength` (30 / 30 / 150); 31st/151st char rejected; no overflow error |
| TC-C07 | Phone (intl-tel-input) validation | V | P2 | On contact form | valid `2015550123`; invalid `123`, letters; alt country code | 1. Enter values with default `+1` and an alternate country | Valid number accepted; malformed number blocked with a phone error; country selector updates dial code |
| TC-C08 | Error clears on correction | V | P2 | Contact form showing errors (from TC-C03/04) | valid replacements | 1. Correct each flagged field 2. Re-submit | `is-invalid`/messages clear on valid input; submission proceeds to success |
| TC-C09 | Site slot caps enforced | F | P3 | Ability to select multiple sites | select >2 sites in a day; >5 total | 1. Attempt to exceed daily (2) and total (5) slot limits | Widget prevents exceeding and surfaces the cap message ("maximum of 2 slots per day" / "up to 5 slots") |
| TC-C10 | Already-contacted site state | F | P3 | A site previously contacted for this trial | previously submitted site | 1. Reopen the trial / site | `#already-contacted-site` state shown; the contact form is not re-presented for that site (no duplicate submission path) |
| TC-C11 | Back navigation preserves widget state | F | P3 | On contact form (after Next) | — | 1. Click **Back** to site selection 2. Return via **Next** | Returns to site list with prior selection intact; re-entering the form does not lose already-entered valid data unexpectedly |
| TC-C12 | Contact form responsive & keyboard a11y | UI / A11y | P3 | Contact form | mobile/tablet/desktop; keyboard only | 1. Render at each breakpoint 2. Tab through fields, toggle consents, submit via keyboard | Layout reflows cleanly; all fields/labels associated; consents toggle via keyboard; focus moves to error/success on submit |
| TC-C13 | Cookie banner does not block flow | F | P2 | First visit, banner present | — | 1. Accept via `#onetrust-accept-btn-handler` 2. Complete a contact submission | After accept, no overlay intercepts clicks on the step toggle or Next/Submit; flow completes |

---

## 10. Deliverables & Traceability
- This strategy document (living; update as the dev app changes).
- Playwright suite mapped 1:1 to the TC IDs above (spec/test title references the ID).
- CI report with per-browser results, traces, and screenshots on failure.
- Defect log with severity, browser, and reproduction from the relevant TC.

---

### Appendix A — Verified selector quick-reference
`#search-medical-conditions` (name `q`) · `#search-study-location` (name `place`, Google Places) · form `action=/clinical-trials/listings/search/` (GET) · autocomplete `.bootstrap-autocomplete.dropdown-menu > a.dropdown-item` (min 3 chars) · `select[name="sort_by"]` · `#location-radius-dropdown` (name `radius`) · `.result-item` (10/pg) · `.search-item--link` · `.pagination .page-link` · `#trialsLoader` · `#advanced-filter-modal` / `#apply-advanced-filters` / `#reset-advanced-filters` / `#clear-all-facets` / `#trial-facets-wrapper` / `#search_result` · `#site-widget` / `#id_site_locator_widget` · `#contact-site-form` · `input[name=firstname|lastname|email|other]` · `#phone-no` · `#age_consent_checkbox` · `#cw-terms-conditions` · `#contact-site-success` (`.fas-success-screen`, post-submit only) / `#success-message-tab`.

*Validation surfaces: `.is-invalid` + `.invalid-feedback` ("Required", "Invalid email address"). No HTML5 `required` attributes — all enforcement is client-side JS.*
