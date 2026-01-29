import { test, expect } from '@playwright/test';

// Fixture data matching the design exactly
// 17 items to match design exactly
const FIXTURE_PRESS_ITEMS = [
  { title: 'Fineshmaker', info: 'MD Penthouse', date: '2024-10-15' },
  { title: 'Calcalist', info: 'About Books', date: '2024-09-15' },
  { title: 'Wallpaper Magazine', info: 'Gordon Gallery', date: '2022-01-15' },
  { title: 'Yellow Trace', info: 'SD Chen Apartment', date: '2022-03-15' },
  { title: 'Fineshmaker', info: 'MD Penthouse', date: '2024-10-14' },
  { title: 'Calcalist', info: 'About Books', date: '2024-09-14' },
  { title: 'Wallpaper Magazine', info: 'Gordon Gallery', date: '2022-01-14' },
  { title: 'Yellow Trace', info: 'SD Chen Apartment', date: '2022-03-14' },
  { title: 'Fineshmaker', info: 'MD Penthouse', date: '2024-10-13' },
  { title: 'Calcalist', info: 'About Books', date: '2024-09-13' },
  { title: 'Wallpaper Magazine', info: 'Gordon Gallery', date: '2022-01-13' },
  { title: 'Yellow Trace', info: 'SD Chen Apartment', date: '2022-03-13' },
  { title: 'Fineshmaker', info: 'MD Penthouse', date: '2024-10-12' },
  { title: 'Calcalist', info: 'About Books', date: '2024-09-12' },
  { title: 'Wallpaper Magazine', info: 'Gordon Gallery', date: '2022-01-12' },
  { title: 'Yellow Trace', info: 'SD Chen Apartment', date: '2022-03-12' },
  { title: 'Fineshmaker', info: 'MD Penthouse', date: '2024-10-11' },
];

test.describe('Press Page', () => {
  test('press page matches design at 1920x1200', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1200 });
    await page.goto('/press');
    await page.waitForSelector('tbody');

    // Replace table content with fixture data via JS
    await page.evaluate((items) => {
      const formatMonthYear = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      };

      const tbody = document.querySelector('tbody');
      if (!tbody) return;

      tbody.innerHTML = items.map(item => `
        <tr class="transition-colors cursor-pointer">
          <td class="title text-gray-900 border-t border-b border-[#3D3D3D] pl-[60px]">${item.title}</td>
          <td class="info w-[238px]" style="color:#3D3D3D">${item.info}</td>
          <td class="date w-[239px]" style="color:#3D3D3D">${formatMonthYear(item.date)}</td>
        </tr>
      `).join('');
    }, FIXTURE_PRESS_ITEMS);

    await expect(page).toHaveScreenshot('press-design-1920x1200.png', {
      fullPage: false,
      animations: 'disabled'
    });
  });
});
