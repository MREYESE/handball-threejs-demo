import { defineConfig, devices } from "@playwright/test";

const verifiedExecutablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;

const chromiumLaunchOptions = {
  args: ["--disable-dev-shm-usage"],
  ...(verifiedExecutablePath === undefined
    ? {}
    : { executablePath: verifiedExecutablePath }),
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  timeout: 60_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    launchOptions: chromiumLaunchOptions,
  },
  projects: [
    {
      name: "functional",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 960, height: 540 },
        trace: "off",
      },
      testMatch: /(functional|qa)\.spec\.ts/,
    },
    {
      name: "capture",
      timeout: 120_000,
      use: { ...devices["Desktop Chrome"], trace: "off" },
      testMatch: /capture\.spec\.ts/,
    },
    {
      name: "profile",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /profile\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
