import { test, expect } from '@playwright/test';

test.describe('Projects Page', () => {
  test('projects page no scroll', async ({ page }) => {
    await page.goto('/projects');
    
    // Wait for page to load
    await page.waitForSelector('#projects-table');
    
    // Take screenshot at top of page
    await expect(page).toHaveScreenshot('projects-no-scroll.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('projects page mid scroll', async ({ page }) => {
    await page.goto('/projects');
    
    // Wait for page to load
    await page.waitForSelector('#projects-table');
    
    // Scroll to middle of the table
    const scrollContainer = page.locator('.overflow-y-auto');
    await scrollContainer.evaluate((element) => {
      element.scrollTop = element.scrollHeight / 2;
    });
    
    // Wait a bit for scroll to settle
    await page.waitForTimeout(500);
    
    // Take screenshot mid-scroll
    await expect(page).toHaveScreenshot('projects-mid-scroll.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});