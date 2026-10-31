import { test, expect } from '@playwright/test';

test('compact home keeps credibility and contact actions while removing requested artwork', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 960);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const metric = page.locator('.impact-stat').last();
  await expect(metric).toContainText('Top 3');
  await expect(metric.getByAltText('Softdex')).toBeVisible();
  await expect(page.locator('.impact-press .impact-media-link')).toHaveAttribute('href', '#blog');
  await expect(page.locator('.impact-press .media-logo-trigger').first()).toBeVisible();
  await expect(page.locator('.impact-press .media-logo-trigger')).toHaveCount(3);
  for (const logo of await page.locator('.impact-press .media-logo-trigger img').all()) {
    expect((await logo.boundingBox())!.width).toBeGreaterThan(40);
  }
  await expect(page.locator('.faq-team-picture')).toBeHidden();
  await expect(page.locator('#contato .section-content > .component-art')).toBeHidden();
  await expect(page.locator('.footer-frame--home .footer-badges')).toBeHidden();
  await expect(page.locator('.footer-frame--home .footer-contact')).toBeHidden();
  await expect(page.locator('.footer-frame--home .footer-address a')).toBeVisible();
  const heading = page.locator('#servicos .section-heading');
  const gaps = await heading.evaluate((element) => {
    const label = element.querySelector('.section-heading-label')!.getBoundingClientRect();
    const title = element.querySelector('.section-heading-title')!.getBoundingClientRect();
    const subtitle = element.querySelector('.section-heading-subtitle')!.getBoundingClientRect();
    return [title.top - label.bottom, subtitle.top - title.bottom];
  });
  expect(gaps[0]).toBeCloseTo(16, 0);
  expect(gaps[1]).toBeCloseTo(24, 0);
});

test('narrow computer scrolls through services and still opens the service link', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ viewport: { width: 522, height: 930 } });
  const page = await context.newPage();
  await page.goto(baseURL!);
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.locator('#services-carousel');
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel).toHaveClass(/is-scroll-driven/);
  const initial = await carousel.evaluate((element) => element.scrollLeft);
  await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'instant' }));
  await expect
    .poll(() => carousel.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(initial + 100);
  await carousel.focus();
  await page.keyboard.press('Home');
  await expect.poll(() => carousel.evaluate((element) => element.scrollLeft)).toBeLessThan(2);
  await carousel.getByRole('link', { name: 'Ver detalhes do serviço' }).click();
  await expect(page).toHaveURL(/colaboradores-agenticos/);
  await context.close();
});

test('QR follows computer identity and download follows Android and iPad identity', async ({
  browser,
  baseURL,
}) => {
  for (const device of [
    { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', touch: false, download: false },
    {
      userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Mobile',
      touch: true,
      download: true,
    },
    {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15',
      touch: true,
      download: true,
    },
  ]) {
    const context = await browser.newContext({
      viewport: { width: 522, height: 930 },
      userAgent: device.userAgent,
      hasTouch: device.touch,
    });
    const page = await context.newPage();
    if (device.touch)
      await page.addInitScript(() =>
        Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 5 }),
      );
    await page.goto(baseURL!);
    await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
    if (device.download) await expect(page.locator('#aplicativo .app-download-cta')).toBeVisible();
    else await expect(page.locator('#aplicativo .app-qr-image')).toBeVisible();
    await context.close();
  }
});
