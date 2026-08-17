import { clerkSetup } from "@clerk/testing/playwright";

/**
 * Run Clerk testing setup only when credentials are present, so the suite still
 * runs (authenticated tests skip themselves) without Clerk secrets configured.
 */
export default async function globalSetup() {
  if (process.env["CLERK_PUBLISHABLE_KEY"] && process.env["CLERK_SECRET_KEY"]) {
    await clerkSetup();
  }
}
