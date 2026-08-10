import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_HOSTED_BASE_URL;
if (baseURL === undefined || baseURL.length === 0) {
  throw new Error("PLAYWRIGHT_HOSTED_BASE_URL is required.");
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "off",
    launchOptions: {
      args: ["--disable-dev-shm-usage"],
    },
  },
  projects: [
    {
      name: "hosted-functional",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 960, height: 540 },
      },
      testMatch: /hosted\.spec\.ts/,
    },
  ],
});
