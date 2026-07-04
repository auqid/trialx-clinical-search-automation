# TrialX Clinical Search — Live DOM Selector Audit

**Target:** https://dev-connect.ainfo.io/clinical-trials/listings/
**Date:** 2026-07-04
**Method:** Playwright MCP against the live dev site (no files edited on the site; DOM queried directly).
**Search term used:** `asthma`

---

## Summary of key findings

- **No login page appeared** — the listings page loaded directly.
- **Two different trial-detail templates** are returned in results (this matters a lot for automation):
  - `/clinicaltrial/<id>/...` (asthma ranks 1–5) → redirect to a **custom "study website" microsite** (`body#study_website`, page title "Homepage", a prescreener form). **None** of the documented contact selectors exist here.
  - `/clinical-trials/listings/<id>/...` (asthma ranks 6–10, `featured=true`) → the **standard listing-detail template** that has the "connect with a site" step and the contact form. Verified using **Version7** (`/clinical-trials/listings/667/version7/`).
- **Condition autocomplete minimum characters = 3** (dropdown hidden at 1–2 chars, appears at 3).
- **`#contact-site-success` is dynamic** — it does **not** exist on page load; it is injected only **after a successful form submission**.
- **Site-slot caps (2/day, 5 total) exist only as JS message strings**, not as static page copy. They surface during site selection when the limit is hit.
- The cookie-consent (OneTrust) overlay intercepts clicks on the step toggle; it must be dismissed before automating clicks in that region.

---

## Selector verification

### Landing page

| Documented selector | Found | Notes / actual selector |
|---|---|---|
| `#search-medical-conditions` | Y | `<input name="q" type="search">` |
| `#search-study-location` | Y | `<input name="place" type="text">` |
| `.search-filter-input` | Y | The "Search on Featured" filter box |
| `#search_medical_list` | Y | This is the **browse-conditions** `<ul>`, **not** the condition autocomplete. Real autocomplete is `.bootstrap-autocomplete.dropdown-menu` with `a.dropdown-item` items. |
| search form action URL | Y | `action="/clinical-trials/listings/search/"` (GET). Emits `?q=&place=&geo_lat=&geo_lng=&user_country=` |

### Results page (`/clinical-trials/listings/search/?q=asthma&...`)

| Documented selector | Found | Notes / actual selector |
|---|---|---|
| `#search` | Y | It's a `<form>` |
| `#study-location-input` | Y | `name="place"` |
| `#location-radius-dropdown` | Y | `<select name="radius">` |
| `#advanced-filter-modal` | Y | `div.modal.fade` |
| `#apply-advanced-filters` | Y | `button.btn.btn-primary` |
| `#reset-advanced-filters` | Y | `button.btn.text-primary` |
| `#clear-all-facets` | Y | `<a>` with `d-none` until facets are active |
| `#trial-facets-wrapper` | Y | — |
| `#search_result` | Y | `div.trial-facets` |
| `.result-item` | Y | 10 per page |
| `.search-item--link` | Y | 10 |
| `select[name="sort_by"]` | Y | — |
| `.pagination .page-link` | Y | Rendered as `<span class="page-link">` |
| `#trialsLoader` | Y | — |

### Contact form (standard detail template — Version7)

| Documented selector | Found | Notes / actual selector |
|---|---|---|
| `a.step-collapse[href="#step1"]` | Y | aria-label "Step one, connect with a site" |
| `#step1` | Y | `div.collapse.show` (expanded by default) |
| `#contact-heading` | Y | `div.step` |
| `#site-widget` | Y | — |
| `#contact-site-form` | Y | `div.row.no-gutters` |
| `input[name="firstname"]` | Y | `maxlength="30"` |
| `input[name="lastname"]` | Y | `maxlength="30"` |
| `input[name="email"]` | Y | `maxlength="150"` |
| `#phone-no` | Y | intl-tel input, no maxlength |
| `input[name="other"]` | Y | `maxlength="30"` |
| `#age_consent_checkbox` | Y | `input.custom-control-input` |
| `#cw-terms-conditions` | Y | `input.custom-control-input` |
| `#contact-site-success` | **Y (dynamic)** | **Not present on page load.** Injected after a successful submit: `<div id="contact-site-success" class="fas-success-screen">`. Related: `#success-message-tab` / `#success-message-item` (tab label "Submitted"), `div.tab-pane#send-message.active.show`, inner `div.alert.alert-success` + `div.fas-success-message`. |

---

## Behavior details

**Autocomplete minimum character count (condition field):** **3.**
Tested with real keystrokes on `#search-medical-conditions`: the `.bootstrap-autocomplete.dropdown-menu` stayed hidden at 1 char (`a`) and 2 chars (`as`), and first appeared at 3 chars (`ast`). No `minlength` HTML attribute on the input — it's the plugin's threshold.

**Input maxlengths:**
- `firstname` = **30**
- `lastname` = **30**
- `other` = **30**
- `email` = **150**
- `phone-no` = none (international phone input)

**Site-slot caps (two/day, five total):** **Present, but only as dynamic JS message strings — not static page text.**
Found in page script:
- `lots_per_day_heading`: "You can select a maximum of **2 slots per day**."
- `you_can_select_up_to_max_total_slots_heading`: "You can select up to **5 slots**; remove a s…" (source string truncated)

These are shown by the site-selection widget when a user hits the limit, not rendered as always-visible copy.

---

## Automation notes / gotchas

1. **Pick the right result.** For `asthma`, ranks 1–5 are test records that redirect to the microsite template (no contact form). Target a `/clinical-trials/listings/<id>/` (featured) trial such as Version7 for the contact flow.
2. **Dismiss the cookie-consent (OneTrust) overlay first** — it intercepts pointer events on `a.step-collapse[href="#step1"]` and blocks clicks. (`#step1` is already expanded by default, so a click may be unnecessary for reading the form.)
3. **`#contact-site-success` requires a completed submission** — asserting it on page load will always fail. The flow is: dismiss consent → fill form → submit → assert `#contact-site-success` (verified visible after a real submission).
