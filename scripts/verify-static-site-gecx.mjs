import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(repoRoot, "packages/gecx-components/.playwright-browsers");
const { chromium } = await import("@playwright/test");

const siteUrl = process.env.STATIC_SITE_URL;
const screenshotPath = resolve(process.env.SCREENSHOT_PATH ?? "artifacts/gcp-deployment/static-site-gecx-irons.png");
const firstPrompt = process.env.CES_TEST_PROMPT ?? "I want to shop for irons";
const secondPrompt = process.env.CES_TEST_FOLLOWUP_PROMPT ?? "I want to see irons for experienced players";
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
  await page.getByLabel("Message Golf Store Assistant").fill(firstPrompt);
  await page.getByRole("button", { name: "Send" }).click();

  const firstAssistantResponse = page.locator(".ces-chat-message.assistant").filter({
    hasText: /handicap|skill|budget|miss|preference|dexterity|iron/i,
  });
  await firstAssistantResponse.last().waitFor({ state: "visible", timeout: 90_000 });

  await page.getByLabel("Message Golf Store Assistant").fill(secondPrompt);
  await page.getByRole("button", { name: "Send" }).click();

  const secondAssistantResponse = page.locator(".ces-chat-message.assistant").filter({
    hasText: /experienced|advanced|low-handicap|skilled|iron/i,
  });
  await secondAssistantResponse.last().waitFor({ state: "visible", timeout: 90_000 });
  await page.locator(".ces-chat-message.assistant cx-product-carousel").last().waitFor({ state: "visible", timeout: 90_000 });

  const firstAnswer = (await firstAssistantResponse.last().innerText()).replace(/\s+/g, " ").trim();
  const secondAnswer = (await secondAssistantResponse.last().innerText()).replace(/\s+/g, " ").trim();
  await page.screenshot({ fullPage: true, path: screenshotPath });

  const quotaMessageVisible = await page
    .getByText("quota is temporarily exhausted")
    .last()
    .isVisible()
    .catch(() => false);
  const carouselRendered = await page.locator(".ces-chat-message.assistant cx-product-carousel").last().isVisible();
  const quotaExhaustedResponses = cesResponses.filter((response) => response.status === 429);
  const missingSuccessfulCalls = [":generateChatToken", ":runSession"].filter(
    (method) => !cesResponses.some((response) => response.url.includes(method) && response.status >= 200 && response.status < 300)
  );

  if (quotaMessageVisible) {
    throw new Error("Quota fallback text is visible to shoppers.");
  }

  if (quotaExhaustedResponses.length) {
    throw new Error(
      `CES returned ${quotaExhaustedResponses.length} quota-exhausted response(s): ${JSON.stringify(cesResponses)}`
    );
  }

  if (missingSuccessfulCalls.length) {
    throw new Error(`Missing successful CES calls: ${missingSuccessfulCalls.join(", ")}`);
  }

  console.log(
    JSON.stringify(
      {
        firstAnswer,
        secondAnswer,
        carouselRendered,
        cesResponses,
        quotaExhaustedResponses,
        quotaMessageVisible,
        prompts: [firstPrompt, secondPrompt],
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
