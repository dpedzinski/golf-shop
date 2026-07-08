import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(repoRoot, "packages/gecx-components/.playwright-browsers");
const { chromium } = await import("@playwright/test");

const siteUrl = process.env.STATIC_SITE_URL;
const screenshotPath = resolve(process.env.SCREENSHOT_PATH ?? "artifacts/gcp-deployment/static-site-gecx-irons.png");
const prompt = process.env.CES_TEST_PROMPT ?? "I am looking for new Irons for my game";
const viewportWidth = Number(process.env.VIEWPORT_WIDTH ?? "1440");
const viewportHeight = Number(process.env.VIEWPORT_HEIGHT ?? "1100");

if (!siteUrl) {
  throw new Error("Set STATIC_SITE_URL to the deployed storefront URL.");
}

await mkdir(dirname(screenshotPath), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: viewportWidth, height: viewportHeight },
});

const cesResponses = [];
page.on("response", (response) => {
  const url = response.url();
  if (url.includes(":generateChatToken") || url.includes(":runSession")) {
    cesResponses.push({ status: response.status(), url });
  }
});

try {
  await page.goto(siteUrl, { waitUntil: "networkidle" });

  await page.getByTestId("ces-chat").waitFor({ state: "visible", timeout: 30_000 });
  await page.getByLabel("Message Golf Store Assistant").fill(prompt);
  await page.getByRole("button", { name: "Send" }).click();

  const assistantResponse = page.locator(".ces-chat-message.assistant").filter({
    hasText: /handicap|skill|budget|miss|preference|dexterity|iron/i,
  });
  await assistantResponse.last().waitFor({ state: "visible", timeout: 90_000 });

  const answer = (await assistantResponse.last().innerText()).replace(/\s+/g, " ").trim();
  await page.screenshot({ fullPage: true, path: screenshotPath });

  const missingSuccessfulCalls = [":generateChatToken", ":runSession"].filter(
    (method) => !cesResponses.some((response) => response.url.includes(method) && response.status >= 200 && response.status < 300)
  );

  if (missingSuccessfulCalls.length) {
    throw new Error(`Missing successful CES calls: ${missingSuccessfulCalls.join(", ")}`);
  }

  console.log(
    JSON.stringify(
      {
        answer,
        cesResponses,
        prompt,
        screenshotPath,
        siteUrl,
        viewport: { height: viewportHeight, width: viewportWidth },
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
