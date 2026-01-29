import { test, expect } from '@playwright/test';

test.describe('Projects page hover state', () => {
  test('shows image on project hover', async ({ page }) => {
    // Navigate to projects page
    await page.goto('/projects');
    
    // Wait for the projects table to load
    await page.waitForSelector('.project-row');
    
    // Get the first project row that should have images (MD Penthouse)
    const firstProjectRow = page.locator('.project-row').first();
    
    // Hover over the project
    await firstProjectRow.hover();
    
    // Wait for the hover image to appear with the show class
    await page.waitForSelector('#hover-image-container.show', { timeout: 5000 });
    
    // Wait a bit for the animation to complete
    await page.waitForTimeout(200);
    
    // Take screenshot of the hover state
    await expect(page).toHaveScreenshot('projects-hover-state.png', {
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width: 1920,
        height: 1200
      }
    });
  });
});