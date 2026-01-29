import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('about page at 1920px width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    await expect(page).toHaveScreenshot('about-1920.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('about page at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    await expect(page).toHaveScreenshot('about-1440.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('about page at 1024px width', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    await expect(page).toHaveScreenshot('about-1024.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('about page has all team member bios', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    // Check all team member names are present (in .name spans)
    await expect(page.locator('.name:text("Motti Rauchwerger")')).toBeVisible();
    await expect(page.locator('.name:text("Hadar Menkes")')).toBeVisible();
    await expect(page.locator('.name:text("Tamara Michaeli")')).toBeVisible();
    await expect(page.locator('.name:text("Shir Aviv")')).toBeVisible();
  });

  test('about page has footer with Instagram and credits', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    const instagramLink = page.locator('a[href*="instagram"]');
    await expect(instagramLink).toBeVisible();

    await expect(page.locator('text=Field Day Studio')).toBeVisible();
    await expect(page.locator('text=Gabi Grinberg')).toBeVisible();
  });

  test('about page has correct intro text', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    await expect(page.locator('text=Salty Architects is a Tel Aviv based studio')).toBeVisible();
  });

  test('about page mobile at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/about');
    await page.waitForSelector('.about-content');

    await expect(page).toHaveScreenshot('about-375.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});
