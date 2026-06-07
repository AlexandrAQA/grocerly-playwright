# Grocerly — E2E tests (Playwright + TypeScript)

End-to-end UI tests for **Grocerly**, a grocery e-commerce web app
(Angular + PrimeNG frontend, Convex backend, Clerk auth, Stripe checkout).

These tests are written with [Playwright](https://playwright.dev/) and
TypeScript, using the **Page Object Model**.

> **About this repository.** The application under test is a real,
> production-grade app maintained in a **separate, private** repository, I
> contribute the E2E suite to it. The product source is intentionally **not**
> published here; this repo is my test code only. The tests are real and run
> against the actual running application.

## What is covered

**Public pages** (no sign-in required):

| Test | What it checks |
|------|----------------|
| Home heading | The home page renders the `Grocerly` heading |
| Browse categories button | The CTA button is visible |
| Search products button | The CTA button is visible |
| Navigation | Clicking *Browse categories* routes to `/categories` |
| Signed-out navbar | `Sign in` / `Sign up` are shown |
| Guarded items hidden | `My Orders`, `Membership`, `Admin` are absent for guests |
| Theme toggle | Switching the theme enables dark mode (html class + `localStorage`) |

**Authentication & guarded pages:**

| Test | What it checks |
|------|----------------|
| Guard redirect | A guest visiting `/dashboard` is redirected to `/sign-in` |
| Sign-in form | The Clerk sign-in form renders |
| Sign-up form | The Clerk sign-up form renders |
| Dashboard access | A signed-in user can open `/dashboard` |
| Dashboard content | The dashboard shows its heading and an active Convex session |

## Approach

- **Page Object Model** — locators and page actions live in `e2e/pages/*`
  (`HomePage`, `NavbarPage`, `AuthPage`); specs read as scenarios and never
  touch the DOM directly.
- **Role-based locators** — `getByRole(...)` over brittle CSS/XPath, for
  resilient, accessibility-aligned selectors.
- **Web-first assertions** — `expect(locator)` matchers with built-in
  auto-waiting; URL checks use regex to stay robust against trailing slashes.
- **Programmatic authentication** — authenticated specs sign in through
  [`@clerk/testing`](https://clerk.com/docs/testing/playwright) (token-based
  sign-in via the Clerk backend), which bypasses the login UI and MFA. The
  global setup and these specs **skip themselves** when Clerk credentials are
  not configured, so the public-page suite always runs.

```
e2e/
  home.spec.ts          # home page and navbar (signed-out)
  auth.spec.ts          # guard redirect + Clerk sign-in / sign-up forms
  dashboard.spec.ts     # authenticated dashboard access and content
  global-setup.ts       # wires up @clerk/testing (no-op without credentials)
  pages/
    home.page.ts        # HomePage   — Page Object for the home page
    navbar.page.ts      # NavbarPage  — Page Object for the top navbar
    auth.page.ts        # AuthPage    — Page Object for the auth pages
playwright.config.ts    # base URL, chromium project, global setup
```

## Running

The app under test is **not** part of this repo. Start Grocerly locally on
`http://localhost:4200`, then:

```bash
npm install
npx playwright install chromium

npm test              # headless
npm run test:headed   # watch the browser
npm run test:ui       # interactive UI mode
npm run report        # open the HTML report
```

The public-page tests need no credentials. The **authenticated** tests require
Clerk test credentials in a `.env.local` file (git-ignored):

```
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
TEST_USER_EMAIL=your-test-user@example.com
```

Without them, the authenticated tests are skipped automatically.

## Roadmap

- **Done:** public pages, navbar, navigation, theme; authenticated dashboard
  access and content via `@clerk/testing`.
- **Next:** full purchase journey (cart → address → Stripe test checkout →
  order confirmation), user registration, and a CI pipeline (GitHub Actions)
  that spins up the whole stack and runs the suite on every push.
