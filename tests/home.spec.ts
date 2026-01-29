import { test, expect } from '@playwright/test';

test.describe('Home page screenshots', () => {
  test('should look ok at 1920x1200', async ({ page }) => {
    // Set viewport to 1920x1200
    await page.setViewportSize({ width: 1920, height: 1200 });
    
    // Navigate to home page
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Wait for carousel image to be visible
    await page.waitForSelector('#carousel-image-1', { state: 'visible' });
    
    // Take screenshot
    await expect(page).toHaveScreenshot('home-page-1920x1200.png');
  });
});