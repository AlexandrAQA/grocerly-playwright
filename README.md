# E2E test automation with Playwright and TypeScript

[![E2E tests](https://github.com/AlexandrAQA/grocerly-playwright/actions/workflows/e2e.yml/badge.svg)](https://github.com/AlexandrAQA/grocerly-playwright/actions/workflows/e2e.yml)

Two end-to-end suites built on the same architecture: Page Object Model, custom
fixtures, storage-state authentication, tagged test selection, accessibility and
visual checks, and a cross-browser matrix that runs in CI on every push.

| Suite | Target | Runs in CI | What it demonstrates |
| --- | --- | --- | --- |
| `e2e/demo` | public demo shop (`saucedemo.com`) | yes, on every push and nightly | full checkout journey, negative authentication cases, catalogue sorting, accessibility gate, visual regression |
| `e2e/api` | public practice API (`api.practicesoftwaretesting.com`) | yes, on every push | REST contract tests, JSON Schema validation with Ajv, token auth, negative and authorization cases |
| `e2e/mock` | public storefront with the catalogue API intercepted | yes, on every push | network-level mocking: exact product set, empty catalogue, backend failure |
| `e2e/*.spec.ts` | **Grocerly**, a real grocery e-commerce app (Angular + PrimeNG, Convex backend, Clerk auth, Stripe checkout) | no, the app is private | route guards, token-based Clerk sign-in, theme persistence, signed-out and signed-in navigation |

The Grocerly application itself lives in a separate private repository. To keep
the work reviewable and reproducible, the same patterns are applied to a public
target, so anyone can clone this repo and get a green run in one command.

## Quick start

```bash
npm ci
npx playwright install --with-deps

npm run test:demo        # public UI suite, Chromium
npm run test:api         # API contract and auth checks
npm run test:mock        # UI against a mocked catalogue API
npm run test:demo:all    # Chromium, Firefox, WebKit, Pixel 5 emulation
npm run test:smoke       # only @smoke
npm run test:a11y        # only accessibility checks
npm run check            # lint + type check, the same gate CI runs
npm run report           # open the last HTML report
```

The Grocerly suite additionally needs the app running on `http://localhost:4200`
and, for the signed-in specs, Clerk credentials in `.env.local`:

```bash
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
TEST_USER_EMAIL=qa+e2e@example.com
```

```bash
npm run test:app
```

Without those variables the authenticated specs skip themselves instead of
failing, so the suite stays usable for anyone without secrets.

## Structure

```
e2e/
  fixtures.ts               # app fixtures: page objects + Clerk sign-in
  global-setup.ts           # wires up @clerk/testing, no-op without credentials
  home.spec.ts              # Grocerly: home page and navbar, signed out
  auth.spec.ts              # Grocerly: route guards, sign-in and sign-up forms
  dashboard.spec.ts         # Grocerly: authenticated dashboard
  pages/                    # Grocerly page objects
  api/
    fixtures.ts             # API clients: anonymous and worker-scoped authenticated
    schemas.ts              # Ajv schemas, contract layer kept apart from assertions
    products.spec.ts        # pagination, sorting, single product, 404 contract
    auth.spec.ts            # login, wrong password, anonymous access, /users/me
  mock/
    products.mock.spec.ts   # route interception: fixed catalogue, empty, 500
  demo/
    fixtures.ts             # demo fixtures, users, storage-state path
    auth.setup.ts           # signs in once, saves the authenticated state
    checkout.spec.ts        # add to cart, checkout, totals, confirmation
    login.spec.ts           # data-driven negative authentication cases
    catalogue.spec.ts       # product list, sorting, cart persistence
    accessibility.spec.ts   # axe-core gate with an explicit baseline
    visual.spec.ts          # screenshot comparison
    pages/                  # demo page objects
.github/workflows/e2e.yml   # type check + 4-project browser matrix + artifacts
```

## Engineering practices

- **Page Object Model.** Locators and actions live in page classes, specs read as
  scenarios and never touch the DOM.
- **Custom fixtures.** `test.extend` injects page objects (and an authenticated
  page) into specs, so there is no repeated construction or copy-pasted setup.
- **Storage-state authentication.** A `setup` project signs in once and saves the
  browser state; every other project depends on it and reuses that state, which
  keeps runs fast and removes login as a shared point of failure. The Grocerly
  suite signs in through the Clerk backend with a testing token, bypassing UI and
  MFA.
- **Locator strategy.** Role-based locators first (`getByRole`), explicit
  `data-test` hooks where the application provides them, CSS structure never.
- **Assertions on values, not strings.** Prices and order totals are parsed into
  numbers, so the checkout test verifies that the total actually equals subtotal
  plus tax instead of matching text.
- **Tags for selection.** `@smoke`, `@regression`, `@e2e`, `@a11y`, `@security`,
  `@visual`, so CI and local runs can pick a slice.
- **Data-driven tests.** Negative authentication cases are generated from a table
  of inputs and expected errors.
- **Cross-browser and mobile.** Chromium, Firefox, WebKit and Pixel 5 emulation.
- **Diagnostics.** Traces, screenshots and video retained on failure; HTML and
  JUnit reports uploaded as CI artifacts; two retries in CI only.
- **API layer with contracts.** A separate suite drives the REST API through
  `APIRequestContext`, validates responses against JSON Schema with Ajv and
  checks authorization separately from authentication.
- **Network mocking.** `page.route` replaces the catalogue response, which makes
  the UI deterministic and reproduces states a live backend will not give you on
  demand: an empty catalogue and a 500 from the backend.
- **Type-aware linting.** ESLint with `typescript-eslint` and
  `eslint-plugin-playwright`; `@typescript-eslint/no-floating-promises` catches a
  missing `await` before it becomes a flaky test.
- **Strict TypeScript.** `strict`, `noUncheckedIndexedAccess`, no unused locals;
  `npm run typecheck` runs in CI before any browser starts.

## Test strategy

Coverage is prioritised by business risk rather than by page count:

1. **Revenue path first.** Sign-in, catalogue, cart, checkout, order
   confirmation. A defect here stops sales, so these specs carry `@smoke` and run
   on every push.
2. **Access control.** Guarded pages must not be reachable without a session, and
   guarded navigation must be hidden from guests.
3. **Data correctness.** Order totals and sorting are checked as numbers, because
   money and ordering bugs are invisible to smoke checks.
4. **Accessibility and visual stability** as gates, not as afterthoughts.

Deliberately not automated: third-party payment provider internals, e-mail
delivery, and one-off admin flows, all of which are cheaper to verify manually
than to keep stable in CI.

## Accessibility gate

`accessibility.spec.ts` runs axe-core against WCAG 2.0 and 2.1 A and AA rules and
fails the build on `critical` and `serious` violations. Existing debt is listed
explicitly in `KNOWN_ISSUES`, and the suite asserts that every known rule is
**still** failing, so a fixed issue forces the baseline to be cleaned up instead
of silently growing.

A real defect found this way on the demo target: the product sort dropdown has no
accessible name (axe rule `select-name`), so screen reader users hear an
unlabelled combo box.

## Visual regression

Screenshot baselines are rendered per operating system, so they are generated
locally (`npm run test:visual:update`) and excluded from the CI run with
`--grep-invert @visual`. Baselines are not committed, which keeps a fresh clone
from failing on a different platform.

## Running in Docker

```bash
docker run --rm -v "$PWD":/work -w /work mcr.microsoft.com/playwright:v1.60.0-noble \
  npx playwright test --project=demo-chromium --grep-invert @visual
```

## Roadmap

- Contract tests generated from the OpenAPI specification.
- Sharding across CI runners with a merged HTML report.
- Performance smoke check with k6 in the nightly pipeline.
