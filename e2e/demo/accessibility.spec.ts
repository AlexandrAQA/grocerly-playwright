import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import type { AxeResults } from "axe-core";
import { test, expect, STORAGE_STATE } from "./fixtures";

/**
 * Accessibility gate.
 *
 * The build fails on `critical` and `serious` violations, because those are the
 * ones that stop a user of assistive technology. Lower severities are attached
 * to the report for information instead of breaking the pipeline.
 *
 * `KNOWN_ISSUES` is a deliberate baseline of accessibility debt that already
 * exists in the application under test. Known rules do not fail the build, but
 * the suite also asserts that they are **still** there: as soon as one is fixed,
 * the test fails and the entry has to be removed, so the baseline cannot rot
 * into a permanent excuse.
 *
 * Current entry: the product sort dropdown has no accessible name, so screen
 * reader users hear an unlabelled combo box (axe rule `select-name`).
 */
const BLOCKING_IMPACTS = new Set(["critical", "serious"]);

const KNOWN_ISSUES: Record<string, string[]> = {
  catalogue: ["select-name"],
};

const scan = (page: Page): Promise<AxeResults> =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

const blockingRuleIds = (results: AxeResults): string[] =>
  results.violations
    .filter((violation) => BLOCKING_IMPACTS.has(violation.impact ?? ""))
    .map((violation) => violation.id)
    .sort();

const assertAgainstBaseline = (results: AxeResults, pageKey: string): void => {
  const known = KNOWN_ISSUES[pageKey] ?? [];
  const found = blockingRuleIds(results);

  const newViolations = found.filter((id) => !known.includes(id));
  expect(newViolations, "new blocking accessibility violations").toEqual([]);

  const fixedSinceBaseline = known.filter((id) => !found.includes(id));
  expect(
    fixedSinceBaseline,
    "known issues that are fixed and can be removed from KNOWN_ISSUES",
  ).toEqual([]);
};

test.describe("accessibility", () => {
  test(
    "login page has no blocking accessibility violations",
    { tag: ["@a11y"] },
    async ({ loginPage, page }, testInfo) => {
      await loginPage.goto();

      const results = await scan(page);
      await testInfo.attach("axe-login.json", {
        body: JSON.stringify(results.violations, null, 2),
        contentType: "application/json",
      });

      assertAgainstBaseline(results, "login");
    },
  );

  test(
    "product catalogue stays within its accessibility baseline",
    { tag: ["@a11y"] },
    async ({ browser }, testInfo) => {
      const context = await browser.newContext({ storageState: STORAGE_STATE });
      const page = await context.newPage();
      await page.goto("/inventory.html");

      const results = await scan(page);
      await testInfo.attach("axe-inventory.json", {
        body: JSON.stringify(results.violations, null, 2),
        contentType: "application/json",
      });

      assertAgainstBaseline(results, "catalogue");
      await context.close();
    },
  );
});
