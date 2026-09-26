import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4183";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    viewport: { width: 320, height: 740 },
    deviceScaleFactor: 1,
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run preview -w web -- --host 127.0.0.1 --port 4183 --strictPort",
    url: `${baseURL}/alpha/today`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
