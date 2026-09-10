import { expect, test } from '@playwright/test';

test('home page shows the TaxOne foundation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'TaxOne' })).toBeVisible();
  await expect(page.getByText('CA practice, accounting and GST automation foundation.')).toBeVisible();
});
