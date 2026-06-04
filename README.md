# Grocerly — E2E tests (Playwright + TypeScript)

End-to-end UI tests for **Grocerly**, a grocery e-commerce web app
(Angular + PrimeNG frontend, Convex backend, Clerk auth, Stripe checkout).

These tests are written with [Playwright](https://playwright.dev/) and
TypeScript, using the **Page Object Model**. The application code lives in a
separate repository; this repo contains the test suite only.

## What is covered

The current suite targets **public pages** (no sign-in required):

| Test | What it checks |
|------|----------------|
| Home heading | The home page renders the `Grocerly` heading |
| Browse categories button | The CTA button is visible |
| Search products button | The CTA button is visible |
| Navigation | Clicking *Browse categories* routes to `/categories` |
| Signed-out navbar | `Sign in` / `Sign up` are shown |
| Guarded items hidden | `My Orders`, `Membership`, `Admin` are absent for guests |
| Theme toggle | Switching the theme enables dark mode (html class + `localStorage`) |

## Approach

- **Page Object Model** — locators and page actions live in `e2e/pages/*`
  (`HomePage`, `NavbarPage`); specs read as scenarios and never touch the DOM
  directly.
- **Role-based locators** — `getByRole(...)` over brittle CSS/XPath, for
  resilient, accessibility-aligned selectors.
- **Web-first assertions** — `expect(locator)` matchers with built-in
  auto-waiting; URL checks use regex to stay robust against trailing slashes.

```
e2e/
  home.spec.ts          # specs for the home page and navbar (signed-out)
  pages/
    home.page.ts        # HomePage  — Page Object for the home page
    navbar.page.ts      # NavbarPage — Page Object for the top navbar
playwright.config.ts    # base URL + chromium project
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

## Roadmap

- **Now:** public pages, navbar, navigation, theme (no credentials needed).
- **Next:** authenticated flows via `@clerk/testing` (Clerk test credentials) —
  cart, address, checkout — and a CI pipeline (GitHub Actions) running the suite
  on every push.
