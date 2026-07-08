import { defineConfig, devices } from "@playwright/test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(appDir, "../..");
const wranglerStateDir = join(appDir, ".wrangler");

process.env.PLAYWRIGHT_BROWSERS_PATH ??= join(repoRoot, "packages/gecx-components/.playwright-browsers");

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command:
      `XDG_CONFIG_HOME=${wranglerStateDir}/config WRANGLER_LOG_PATH=${wranglerStateDir}/logs/playwright.log WRANGLER_REGISTRY_PATH=${wranglerStateDir}/registry VITE_GECX_PROJECT_ID=demo-project VITE_GECX_LOCATION=global VITE_GECX_APP_ID=demo-app VITE_GECX_DEPLOYMENT_ID=demo-deployment VITE_GECX_AGENT_ID=demo-agent npm run dev -- --port 4180`,
    url: "http://localhost:4180",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120_000,
  },
  use: {
    baseURL: "http://localhost:4180",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
});
