import { expect, test } from "@playwright/test";

test("renders storefront widgets and configured GECX messenger", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Reusable components backed by the product API" })).toBeVisible();
  await expect(page.locator("cx-product-list")).toHaveCount(1);
  await expect(page.locator("cx-product-comparison")).toHaveCount(1);

  const messenger = page.locator('[data-testid="gecx-messenger-container"] df-messenger');
  await expect(messenger).toHaveAttribute("project-id", "demo-project");
  await expect(messenger).toHaveAttribute("agent-id", "demo-agent");
});
