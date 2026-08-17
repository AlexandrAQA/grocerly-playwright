import { test, expect } from "./fixtures";
import { expectValidProduct, expectValidProductPage, type ProductPage } from "./schemas";

test.describe("products API", () => {
  test(
    "product list returns a valid paginated contract",
    { tag: ["@smoke", "@api"] },
    async ({ api }) => {
      const response = await api.get("/products");

      expect(response.status()).toBe(200);
      expect(response.headers()["content-type"]).toContain("application/json");

      const body = (await response.json()) as ProductPage;
      expectValidProductPage(body);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data.length).toBeLessThanOrEqual(body.per_page);
    },
  );

  test(
    "single product matches the schema and the requested id",
    { tag: ["@api"] },
    async ({ api }) => {
      const list = (await (await api.get("/products")).json()) as ProductPage;
      const expected = list.data[0];
      expect(expected, "product list is empty").toBeDefined();

      const response = await api.get(`/products/${expected!.id}`);

      expect(response.status()).toBe(200);
      const product = await response.json();
      expectValidProduct(product);
      expect(product.id).toBe(expected!.id);
      expect(product.name).toBe(expected!.name);
    },
  );

  test(
    "sorting by price returns ascending prices",
    { tag: ["@api", "@regression"] },
    async ({ api }) => {
      const response = await api.get("/products", {
        params: { sort: "price,asc" },
      });

      expect(response.status()).toBe(200);
      const body = (await response.json()) as ProductPage;
      const prices = body.data.map((product) => product.price);

      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    },
  );

  test(
    "pagination returns different items on the second page",
    { tag: ["@api", "@regression"] },
    async ({ api }) => {
      const first = (await (
        await api.get("/products", { params: { page: 1 } })
      ).json()) as ProductPage;
      const second = (await (
        await api.get("/products", { params: { page: 2 } })
      ).json()) as ProductPage;

      expect(second.current_page).toBe(2);
      const firstIds = first.data.map((product) => product.id);
      const secondIds = second.data.map((product) => product.id);
      expect(secondIds.some((id) => firstIds.includes(id))).toBe(false);
    },
  );

  test(
    "unknown product id returns 404 instead of an empty success",
    { tag: ["@api", "@regression"] },
    async ({ api }) => {
      const response = await api.get("/products/definitely-not-a-real-id");

      expect(response.status()).toBe(404);
    },
  );
});
