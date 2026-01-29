# Pixel Perfect Snapshot Testing

Guide for testing pages against design files using Playwright.

## Setup

1. Get exact viewport dimensions from design file:
```bash
sips -g pixelWidth -g pixelHeight "design/page.png"
```

2. Copy design as expected snapshot:
```bash
cp "design/page.png" "tests/page.spec.ts-snapshots/page-design-chromium-darwin.png"
```

## Mocking CMS Data

Since pages are statically generated at build time, Playwright route interception doesn't work. Instead, use `page.evaluate()` to replace content after load:

```typescript
const FIXTURE_DATA = [
  { title: 'Item 1', info: 'Info 1', date: '2024-10-15' },
  // ... match design exactly
];

test('page matches design', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1200 });
  await page.goto('/page');
  await page.waitForSelector('tbody');

  // Replace content with fixture data
  await page.evaluate((items) => {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = items.map(item => `
      <tr>
        <td>${item.title}</td>
        <td>${item.info}</td>
      </tr>
    `).join('');
  }, FIXTURE_DATA);

  await expect(page).toHaveScreenshot('page-design.png', {
    fullPage: false,
    animations: 'disabled'
  });
});
```

## Workflow

1. Create test with correct viewport from design dimensions
2. Add fixture data matching the design content exactly
3. Copy design file as expected snapshot
4. Run test: `npx playwright test tests/page.spec.ts`
5. View diff to identify layout issues
6. Fix layout, re-run test
7. Repeat until pixel diff is 0

## Output Files

After test failure:
- **Expected:** `tests/*.spec.ts-snapshots/*-chromium-darwin.png`
- **Actual:** `test-results/*/...-actual.png`
- **Diff:** `test-results/*/...-diff.png`

Red pixels in diff = layout differences between implementation and design.

## Tips

- Route interception (`page.route()`) doesn't work for static pages - use `page.evaluate()` instead
- Match fixture data exactly to design to isolate layout issues from content differences
- Use `animations: 'disabled'` to avoid flaky tests
- Snapshot names include browser and OS: `*-chromium-darwin.png`
