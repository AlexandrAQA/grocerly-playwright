import { test as base, expect, request, type APIRequestContext } from "@playwright/test";

/**
 * Fixtures for the API suite.
 *
 * `api` is an unauthenticated client, `authedApi` performs the login once per
 * worker and injects the bearer token, so specs never repeat authentication
 * plumbing and a token change touches one place only.
 */

export const API_BASE_URL =
  process.env["API_BASE_URL"] ?? "https://api.practicesoftwaretesting.com";

export const credentials = {
  email: process.env["API_USER"] ?? "customer@practicesoftwaretesting.com",
  password: process.env["API_PASSWORD"] ?? "welcome01",
};

type ApiFixtures = {
  api: APIRequestContext;
};

type WorkerFixtures = {
  authedApi: APIRequestContext;
};

export const test = base.extend<ApiFixtures, WorkerFixtures>({
  api: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: { Accept: "application/json" },
    });
    await use(context);
    await context.dispose();
  },

  authedApi: [
    async ({}, use) => {
      const anonymous = await request.newContext({ baseURL: API_BASE_URL });
      const login = await anonymous.post("/users/login", {
        data: credentials,
      });
      expect(
        login.ok(),
        `login failed with status ${login.status()}`,
      ).toBeTruthy();

      const { access_token: token } = (await login.json()) as {
        access_token: string;
      };
      await anonymous.dispose();

      const context = await request.newContext({
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      await use(context);
      await context.dispose();
    },
    { scope: "worker" },
  ],
});

export { expect };
