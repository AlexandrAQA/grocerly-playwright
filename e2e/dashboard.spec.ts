import { test, expect } from "./fixtures";

/**
 * The `signedInPage` fixture performs a token-based Clerk sign-in and skips the
 * test when Clerk credentials are not configured, so these specs add no setup
 * noise and never fail for a contributor without secrets.
 */
test.describe("dashboard, signed in", () => {
  test(
    "signed-in user can open the dashboard",
    { tag: ["@smoke"] },
    async ({ signedInPage }) => {
      await signedInPage.goto("/dashboard");
      await expect(signedInPage).toHaveURL("/dashboard");
    },
  );

  test(
    "dashboard shows the signed-in user content",
    { tag: ["@regression"] },
    async ({ signedInPage }) => {
      await signedInPage.goto("/dashboard");

      await expect(
        signedInPage.getByRole("heading", { name: "Dashboard" }),
      ).toBeVisible();
      await expect(signedInPage.getByText("Convex session active")).toBeVisible();
    },
  );
});
