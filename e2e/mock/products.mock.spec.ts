import { test, expect } from "@playwright/test";

/**
 * Network-level mocking.
 *
 * The storefront renders its catalogue from a public API. Intercepting that
 * call makes the UI deterministic and lets the suite reproduce states that are
 * hard to create on a live backend: an exact product set, an empty catalogue
 * and a backend failure.
 */

/** Glob patterns treat "?" as a single character, so the catalogue endpoint
 * is matched by a predicate on the parsed URL instead. */
const isCatalogueRequest = (url: URL): boolean => url.pathname === "/products";

const fakeCatalogue = (names: string[]) => ({
  current_page: 1,
  from: 1,
  last_page: 1,
  per_page: 9,
  to: names.length,
  total: names.length,
  data: names.map((name, index) => ({
    id: `mock-${index}`,
    name,
    description: "Mocked product used by the UI contract test",
    price: 10 + index,
    is_location_offer: false,
    is_rental: false,
    in_stock: true,
    product_image: {
      id: `mock-image-${index}`,
      file_name: "mock.jpg",
      title: "mock",
      source_name: "mock",
      source_url: "https://example.com",
    },
  })),
});

test.describe("catalogue rendering against a mocked API", () => {
  test(
    "UI renders exactly the products returned by the API",
    { tag: ["@mock", "@smoke"] },
    async ({ page }) => {
      const names = ["Mock Hammer", "Mock Screwdriver"];
      await page.route(isCatalogueRequest, async (route) => {
        await route.fulfill({ json: fakeCatalogue(names) });
      });

      await page.goto("/");

      const rendered = page.locator('[data-test="product-name"]');
      await expect(rendered).toHaveCount(names.length);
      await expect(rendered).toHaveText(names);
    },
  );

  test(
    "empty catalogue does not render product cards",
    { tag: ["@mock", "@regression"] },
    async ({ page }) => {
      await page.route(isCatalogueRequest, async (route) => {
        await route.fulfill({ json: fakeCatalogue([]) });
      });

      await page.goto("/");

      await expect(page.locator('[data-test="product-name"]')).toHaveCount(0);
      await expect(page.locator("body")).toBeVisible();
    },
  );

  test(
    "backend failure keeps the page alive instead of crashing",
    { tag: ["@mock", "@regression"] },
    async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("pageerror", (error) => consoleErrors.push(error.message));

      await page.route(isCatalogueRequest, async (route) => {
        await route.fulfill({
          status: 500,
          json: { message: "Internal Server Error" },
        });
      });

      await page.goto("/");

      await expect(page.locator('[data-test="product-name"]')).toHaveCount(0);
      await expect(page.locator("nav, header").first()).toBeVisible();
      expect(
        consoleErrors,
        `unhandled page errors: ${consoleErrors.join("; ")}`,
      ).toEqual([]);
    },
  );
});
