// @ts-check
import { test, expect, testData } from '../../fixtures';

/**
 * TC-S02 — Condition autocomplete 3-character threshold.
 * Driven with REAL sequential key presses (not fill), the bootstrap-autocomplete
 * dropdown must stay hidden at 1 and 2 chars and appear at exactly 3.
 */
test('TC-S02 autocomplete dropdown appears only at 3+ chars @smoke @regression', async ({
  landingSearchPage,
}) => {
  const term = testData.searchTerms.autocompleteAtMin; // "ast" — exactly 3 chars
  const input = landingSearchPage.conditionInput;
  const dropdown = landingSearchPage.autocompleteDropdown;

  await landingSearchPage.open();
  await input.click();

  // 1 char — below threshold, dropdown stays hidden.
  await input.pressSequentially(term[0]);
  await expect(dropdown).toBeHidden();

  // 2 chars — still below threshold.
  await input.pressSequentially(term[1]);
  await expect(dropdown).toBeHidden();

  // 3 chars — threshold reached, dropdown shows with selectable suggestions.
  // The dropdown is gated on a live XHR to the (shared, sometimes-slow) dev server,
  // so give this network-bound appearance a generous timeout to avoid load flakiness.
  await input.pressSequentially(term[2]);
  await expect(dropdown).toBeVisible({ timeout: 20_000 });
  await expect(landingSearchPage.autocompleteOptions.first()).toBeVisible({ timeout: 20_000 });
});
