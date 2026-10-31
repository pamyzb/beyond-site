import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1063, height: 930 }, hasTouch: false, isMobile: false });

test('press link reaches the blog without being captured by the cases reading hold', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('html[data-ready=true]').waitFor();
  const link = page.getByRole('link', { name: 'Ver matérias', exact: true });
  await link.scrollIntoViewIfNeeded();
  await link.click();
  const positions = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const positions: number[] = [];
        const start = performance.now();
        const sample = () => {
          positions.push(Math.round(scrollY));
          if (performance.now() - start < 500) requestAnimationFrame(sample);
          else resolve(positions);
        };
        requestAnimationFrame(sample);
      }),
  );
  expect(new Set(positions).size).toBeGreaterThan(3);
  await expect(page).toHaveURL(/#blog$/);
  await expect
    .poll(() => page.locator('#blog').evaluate((element) => element.getBoundingClientRect().top))
    .toBeGreaterThanOrEqual(0);
  await expect
    .poll(() => page.locator('#blog').evaluate((element) => element.getBoundingClientRect().top))
    .toBeLessThan(150);
  // The case entrance used to restore its held scroll position after the jump.
  await page.waitForTimeout(1500);
  const top = await page
    .locator('#blog')
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(top).toBeGreaterThanOrEqual(0);
  expect(top).toBeLessThan(150);
});
