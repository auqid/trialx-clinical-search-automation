// @ts-check
import { test, expect, testData } from '../../fixtures';

/**
 * TC-S07 — No-results empty state + reflected-input escaping.
 * A gibberish query shows the "No clinical trials found for '<query>'." message;
 * XSS probes must be echoed ESCAPED (rendered as literal text, no injected node,
 * no dialog).
 */
const searchUrl = (q) =>
  `/clinical-trials/listings/search/?q=${encodeURIComponent(q)}&place=&geo_lat=&geo_lng=&user_country=`;

test('TC-S07 gibberish query shows the no-results message @smoke @regression', async ({
  searchResultsPage,
  page,
}) => {
  const term = testData.searchTerms.noResults;

  await page.goto(searchUrl(term), { waitUntil: 'domcontentloaded' });
  await searchResultsPage.waitForResults();

  await expect(searchResultsPage.resultItems).toHaveCount(0);
  await expect(searchResultsPage.noResultsMessage).toBeVisible();
  // The message echoes the query back.
  await expect(searchResultsPage.noResultsMessage).toContainText(term);
});

test('TC-S07 reflected query is escaped, not injected @regression', async ({
  searchResultsPage,
  page,
}) => {
  // Fail loudly if any probe manages to open a dialog.
  let dialogFired = false;
  page.on('dialog', async (d) => {
    dialogFired = true;
    await d.dismiss();
  });

  for (const probe of testData.searchTerms.reflectedProbes) {
    await page.goto(searchUrl(probe), { waitUntil: 'domcontentloaded' });
    await searchResultsPage.waitForResults();

    await expect(searchResultsPage.noResultsMessage).toBeVisible();

    // Escaped echo: the angle brackets survive as LITERAL text. If the probe had
    // been parsed as HTML, the tags would become elements and these characters
    // would not appear in the text node.
    // NOTE: the app sanitises/normalises the input before escaping (e.g. <b> ->
    // <strong>, src=x -> src="x"), so we assert the security invariant here rather
    // than a character-identical echo of the raw probe.
    await expect(searchResultsPage.noResultsMessage).toContainText('<');
    await expect(searchResultsPage.noResultsMessage).toContainText('>');

    // No live node was injected from the probe, and no dialog fired.
    await expect(page.locator('#search_result img[src="x"]')).toHaveCount(0);
    expect(dialogFired, `a dialog fired for probe: ${probe}`).toBe(false);
  }
});
