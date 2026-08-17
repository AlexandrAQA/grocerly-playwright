import Ajv, { type ErrorObject } from "ajv";
import { expect } from "@playwright/test";

/**
 * Contract layer of the API suite.
 *
 * Schemas describe the shape of the response, business assertions live in the
 * specs. Keeping the two apart means a broken contract (a field that changed
 * type or disappeared) fails with a different message than a wrong value.
 */

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  in_stock: boolean;
  category?: unknown;
  brand?: unknown;
};

export type ProductPage = {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
  data: Product[];
};

const ajv = new Ajv({ allErrors: true, strict: false });

const productSchema = {
  type: "object",
  required: [
    "id",
    "name",
    "description",
    "price",
    "is_location_offer",
    "is_rental",
    "in_stock",
  ],
  properties: {
    id: { type: "string", minLength: 1 },
    name: { type: "string", minLength: 1 },
    description: { type: "string" },
    price: { type: "number", exclusiveMinimum: 0 },
    is_location_offer: { type: "boolean" },
    is_rental: { type: "boolean" },
    in_stock: { type: "boolean" },
  },
};

const productPageSchema = {
  type: "object",
  required: ["current_page", "last_page", "per_page", "total", "data"],
  properties: {
    current_page: { type: "integer", minimum: 1 },
    from: { type: ["integer", "null"] },
    last_page: { type: "integer", minimum: 1 },
    per_page: { type: "integer", minimum: 1 },
    to: { type: ["integer", "null"] },
    total: { type: "integer", minimum: 0 },
    data: { type: "array", items: productSchema },
  },
};

const validateProduct = ajv.compile(productSchema);
const validateProductPage = ajv.compile(productPageSchema);

const describeErrors = (errors: ErrorObject[] | null | undefined): string =>
  (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? ""}`)
    .join("; ");

export const expectValidProduct = (payload: unknown): void => {
  const valid = validateProduct(payload);
  expect(valid, describeErrors(validateProduct.errors)).toBe(true);
};

export const expectValidProductPage = (payload: unknown): void => {
  const valid = validateProductPage(payload);
  expect(valid, describeErrors(validateProductPage.errors)).toBe(true);
};
