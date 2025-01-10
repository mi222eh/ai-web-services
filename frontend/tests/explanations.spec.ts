import { test, expect } from '@playwright/test';

test.describe('Explanations', () => {
  test('should create a new explanation', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3001');

    // Type a word in the search box
    await page.fill('input[placeholder="Sök"]', 'test');

    // Click the search button (Plus button)
    await page.click('button.rounded-full');

    // Wait for loading state
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Wait for the explanation card to be visible
    await expect(page.locator('.card')).toBeVisible();

    // Verify that the explanation contains content
    const synonymsSection = await page.locator('text=Synonymer:');
    const explanationSection = await page.locator('text=Förklaring:');
    
    expect(await synonymsSection.isVisible()).toBeTruthy();
    expect(await explanationSection.isVisible()).toBeTruthy();
  });

  test('should retry generating explanation', async ({ page }) => {
    // Navigate to the home page
    await page.goto('http://localhost:3001');

    // Type a word in the search box
    await page.fill('input[placeholder="Sök"]', 'test');

    // Click the search button (Plus button)
    await page.click('button.rounded-full');

    // Wait for the explanation card to be visible
    await expect(page.locator('.card')).toBeVisible();

    // Click the retry button
    await page.click('button:has-text("Försök igen")');

    // Wait for loading state
    await expect(page.locator('.animate-spin')).toBeVisible();

    // Wait for the new explanation to be generated
    await expect(page.locator('.card')).toBeVisible();

    // Verify that the explanation contains content
    const synonymsSection = await page.locator('text=Synonymer:');
    const explanationSection = await page.locator('text=Förklaring:');
    
    expect(await synonymsSection.isVisible()).toBeTruthy();
    expect(await explanationSection.isVisible()).toBeTruthy();
  });
}); 