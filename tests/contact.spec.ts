import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('contact page at 1920px width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    await expect(page).toHaveScreenshot('contact-1920.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('contact page at 1440px width', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    await expect(page).toHaveScreenshot('contact-1440.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('contact page at 1024px width', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    await expect(page).toHaveScreenshot('contact-1024.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });

  test('contact page has all contact rows', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    const contactRows = page.locator('.contact-row');
    await expect(contactRows).toHaveCount(5);

    await expect(page.locator('[data-testid="contact-row-0"]')).toContainText('Office');
    await expect(page.locator('[data-testid="contact-row-1"]')).toContainText('Hadar');
    await expect(page.locator('[data-testid="contact-row-2"]')).toContainText('Motti');
    await expect(page.locator('[data-testid="contact-row-3"]')).toContainText('Shir');
    await expect(page.locator('[data-testid="contact-row-4"]')).toContainText('Tamara');
  });

  test('contact page has working email links', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    const emailLinks = page.locator('.contact-email a');
    await expect(emailLinks).toHaveCount(5);

    const officeEmail = page.locator('[data-testid="contact-row-0"] .contact-email a');
    await expect(officeEmail).toHaveAttribute('href', 'mailto:office@saltyarch.com');
  });

  test('contact page has working phone links', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    const phoneLinks = page.locator('.contact-phone a');
    await expect(phoneLinks).toHaveCount(4);

    const hadarPhone = page.locator('[data-testid="contact-row-1"] .contact-phone a');
    await expect(hadarPhone).toHaveAttribute('href', 'tel:+972508833981');
  });

  test('contact page mobile at 375px width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/contact');
    await page.waitForSelector('.contact-container');

    await expect(page).toHaveScreenshot('contact-375.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});
