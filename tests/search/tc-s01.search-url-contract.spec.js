// @ts-check
import { test, expect, testData } from '../../fixtures';

/**
 * TC-S01 — Landing search → results URL contract.
 * Type a condition, submit, and assert navigation to the search results URL
 * carrying the query, plus at least one result card.
 */
test('TC-S01 landing search navigates to results URL with the query @smoke @regression', async ({
  landingSearchPage,
  searchResultsPage,
  page,
}) => {
  const term = testData.searchTerms.valid; // "asthma"

  await landingSearchPage.open();
  await landingSearchPage.typeCondition(term);
  await landingSearchPage.submit();

  // URL contract: /clinical-trials/listings/search/?q=<term>&...
  await expect(page).toHaveURL(new RegExp(`/clinical-trials/listings/search/\\?.*\\bq=${term}\\b`));

  await searchResultsPage.waitForResults();
  // Results render is a live XHR to the shared dev server — generous timeout.
  await expect(searchResultsPage.resultItems.first()).toBeVisible({ timeout: 20_000 });
  expect(await searchResultsPage.resultItems.count()).toBeGreaterThanOrEqual(1);
});
