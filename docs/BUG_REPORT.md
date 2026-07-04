# Known Findings — TrialX Clinical-Trials Search & Study-Contact

Findings surfaced while building and running the automated suite against the dev
environment (`https://dev-connect.ainfo.io`). Severity is from a front-end/QA
perspective. Items marked _Verified safe_ are positive results, not defects.

---

## 1. "Back" button mislabelled `aria-label="Send Message"` — Accessibility (Low/Med)

**Area:** Study-contact "Send a message" step (site widget).
**Description:** On the contact form step, both the primary submit button and the
**Back** button expose `aria-label="Send Message"`. A screen-reader user hears
"Send Message" for the control that actually navigates back.
**Impact:** Misleading for assistive tech; also forces automation to select the
submit button by class (`.fas-button-primary`) instead of its accessible name.
**Expected:** The Back button should be labelled "Back" (or similar).
**Actual:** Both buttons announce "Send Message".

## 2. Already-contacted resubmission is a silent no-op — UX (Medium)

**Area:** Study-contact submission pipeline.
**Description:** The "already-contacted" state is keyed on **site + email**.
Submitting the form again for the same site with the same email produces **no
success screen, no error, and no validation message** — the form simply stays as-is.
**Steps:** Contact a site with an email → return and submit again for the same
site with the same email.
**Expected:** A clear message (e.g. "You have already contacted this site").
**Actual:** The submit button is enabled, the click is accepted, and nothing
visible happens.
**Note:** The suite works around this for its own determinism by using a unique
synthetic email per submission — it does not mask the product behaviour.

## 3. Sort by "distance" with no location empties the results — UX (Low)

**Area:** Search results, sort control.
**Description:** Selecting **distance** sort without a location returns the
"No clinical trials found" empty state and removes the sort dropdown, rather than
keeping the current results unsorted or prompting for a location.
**Expected:** Prompt for a location, or keep results and disable distance ordering.
**Actual:** Results are cleared to the empty state.
**Severity:** Low — arguably by design, documented so the test asserts the real
behaviour rather than an assumed one.

---

## Verified safe (not defects)

- **Reflected search input is escaped.** Probes such as `<b>x</b>` and
  `"><img src=x>` are sanitised/normalised and rendered as escaped text in the
  "No clinical trials found for '…'" message — no node injection, no dialog.
- **Two detail templates exist.** Featured trials live at
  `/clinical-trials/listings/<id>/` (standard template, has the contact form);
  `/clinicaltrial/<id>/` is a marketing microsite with no contact form. Not a
  bug, but a routing gotcha — the `featuredTrial` fixture guards against it.
