import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command:
      "VITE_GECX_PROJECT_ID=demo-project VITE_GECX_LOCATION=global VITE_GECX_AGENT_ID=demo-agent npm run dev -- --port 4180",
    url: "http://127.0.0.1:4180",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
  use: {
    baseURL: "http://127.0.0.1:4180",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } },
    },
  ],
});
