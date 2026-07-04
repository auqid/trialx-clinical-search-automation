// @ts-check
import { test, expect, testData } from '../../fixtures';

/**
 * TC-S05 — Sort options (data-driven).
 * For each sort_by key, select it and assert results reload without error.
 * Kept lenient: we assert the selection applies and results reload — NOT the exact
 * ordering semantics of each key (a strategy CONFIRM item).
 *
 * "distance" is handled as its own case because it needs a location: verified
 * behaviour is that selecting it WITHOUT a location returns the empty state and
 * removes the sort control, so it can't share the results-based assertions.
 */
const RESULTS_URL =
  '/clinical-trials/listings/search/?q=asthma&place=&geo_lat=&geo_lng=&user_country=';

const resultSortKeys = testData.sortOptions.filter((key) => key !== 'distance');

test.describe('TC-S05 sort options reload results @smoke @regression', () => {
  for (const sortKey of resultSortKeys) {
    test(`TC-S05 sort by "${sortKey}" reloads results without error`, async ({
      searchResultsPage,
      page,
    }) => {
      await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded' });
      await searchResultsPage.waitForResults();
      await expect(searchResultsPage.resultItems.first()).toBeVisible({ timeout: 20_000 });

      await searchResultsPage.sortBy(sortKey);

      // Selection applied (proves the key is a real option) and results reloaded.
      // The reload is a live XHR to the shared dev server, so use generous timeouts
      // to avoid flakiness under concurrent load.
      // TODO: confirm exact ordering semantics for each key.
      await expect(searchResultsPage.sortSelect).toHaveValue(sortKey, { timeout: 20_000 });
      await expect(searchResultsPage.resultItems.first()).toBeVisible({ timeout: 20_000 });
    });
  }

  test('TC-S05 sort by "distance" without a location returns the no-results state', async ({
    searchResultsPage,
    page,
  }) => {
    await page.goto(RESULTS_URL, { waitUntil: 'domcontentloaded' });
    await searchResultsPage.waitForResults();
    await expect(searchResultsPage.resultItems.first()).toBeVisible({ timeout: 20_000 });

    await searchResultsPage.sortBy('distance');

    // Verified app behaviour: distance ranking needs a geo point; with no location
    // the app returns the empty state and drops the sort control (so we do not
    // assert on select[name="sort_by"] here).
    // TODO: confirm proximity ordering WITH a location set.
    await expect(searchResultsPage.noResultsMessage).toBeVisible({ timeout: 20_000 });
  });
});
