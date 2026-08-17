import { test, expect, credentials } from "./fixtures";

test.describe("authentication API", () => {
  test(
    "valid credentials return a token",
    { tag: ["@smoke", "@api"] },
    async ({ api }) => {
      const response = await api.post("/users/login", { data: credentials });

      expect(response.status()).toBe(200);
      const body = (await response.json()) as { access_token?: string };
      expect(body.access_token, "token is missing in the response").toBeTruthy();
      expect(body.access_token!.split(".")).toHaveLength(3);
    },
  );

  test(
    "wrong password is rejected with 401 and no token",
    { tag: ["@api", "@security"] },
    async ({ api }) => {
      const response = await api.post("/users/login", {
        data: { email: credentials.email, password: "definitely-wrong" },
      });

      expect(response.status()).toBe(401);
      const body = await response.text();
      expect(body).not.toContain("access_token");
    },
  );

  test(
    "protected endpoint rejects an anonymous request",
    { tag: ["@api", "@security"] },
    async ({ api }) => {
      const response = await api.get("/users/me");

      expect([401, 403]).toContain(response.status());
    },
  );

  test(
    "protected endpoint returns the authenticated user",
    { tag: ["@api", "@security"] },
    async ({ authedApi }) => {
      const response = await authedApi.get("/users/me");

      expect(response.status()).toBe(200);
      const user = (await response.json()) as { email?: string };
      expect(user.email).toBe(credentials.email);
    },
  );
});
