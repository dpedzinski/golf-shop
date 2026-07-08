import { expect, test } from '@playwright/test';

test('standalone demo renders financing widgets and action events', async ({ page }) => {
  await page.goto('/demo/standalone.html');

  await expect(page.getByText('Available card offers')).toBeVisible();
  await expect(page.getByText('Store Rewards Card')).toBeVisible();

  await page.getByRole('button', { name: 'Review offer' }).click();
  await expect(page.locator('#event-log')).toContainText('apply-store-card');
});

test('demo index renders the full widget set', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Compare financing choices')).toBeVisible();
  await expect(page.getByText('Estimated payment plans')).toBeVisible();
  await expect(page.getByText('Recommended gear')).toBeVisible();
  await expect(page.getByText('Offers for Strata Ultimate Complete Golf Set')).toBeVisible();
  await expect(page.getByText('Next steps')).toBeVisible();
  await expect(page.getByText('Financing disclosure')).toBeVisible();
});
