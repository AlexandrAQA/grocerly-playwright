import { test, expect, users, password } from "./fixtures";

/** Authentication tests always start from a clean, unauthenticated context. */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("authentication", () => {
  test(
    "valid credentials open the product catalogue",
    { tag: ["@smoke"] },
    async ({ loginPage, inventoryPage }) => {
      await loginPage.goto();
      await loginPage.login(users.standard, password);
      await inventoryPage.expectLoaded();
    },
  );

  const negativeCases = [
    {
      name: "wrong password",
      user: users.standard,
      pass: "wrong-password",
      error: /username and password do not match/i,
    },
    {
      name: "locked out user",
      user: users.locked,
      pass: password,
      error: /sorry, this user has been locked out/i,
    },
    {
      name: "missing username",
      user: "",
      pass: password,
      error: /username is required/i,
    },
    {
      name: "missing password",
      user: users.standard,
      pass: "",
      error: /password is required/i,
    },
  ] as const;

  for (const testCase of negativeCases) {
    test(
      `rejects sign-in: ${testCase.name}`,
      { tag: ["@regression"] },
      async ({ loginPage, page }) => {
        await loginPage.goto();
        await loginPage.login(testCase.user, testCase.pass);

        await loginPage.expectError(testCase.error);
        await expect(page).not.toHaveURL(/inventory/);
      },
    );
  }

  test(
    "guarded page is not reachable without a session",
    { tag: ["@regression", "@security"] },
    async ({ page, loginPage }) => {
      await page.goto("/inventory.html");

      await loginPage.expectError(/you can only access '\/inventory\.html'/i);
    },
  );
});
