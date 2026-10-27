import { test, expect } from '@playwright/test';

test('application cards stay centered after navigation and resize', async ({ page }) => {
  await page.goto('/colaboradores-agenticos/');
  const stage = page.locator('.circular-carousel-stage');
  const card = page.locator('.circular-carousel-card[data-active="true"]');
  for (const width of [390, 320, 768, 1440]) {
    await page.setViewportSize({ width, height: 930 });
    for (let index = 0; index < 4; index++) {
      await expect
        .poll(async () => {
          const frame = await stage.boundingBox();
          const active = await card.boundingBox();
          if (!frame || !active) return Infinity;
          return Math.abs(active.x + active.width / 2 - (frame.x + frame.width / 2));
        })
        .toBeLessThan(2);
      const bounds = (await card.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      await page.getByRole('button', { name: 'Próxima aplicação', exact: true }).click();
    }
  }
});

test('service integrates Home navigation, local anchors and static metadata', async ({ page }) => {
  const initialViewport = page.viewportSize()!;
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Service content and navigation must survive an unavailable 3D scene.
  await page.route('https://prod.spline.design/**', (route) => route.abort());
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const entry = page.getByRole('link', { name: 'Ver detalhes do serviço' });
  await expect(entry).toHaveAttribute('href', '/colaboradores-agenticos/');
  await entry.click();
  await expect(page).toHaveURL(/\/colaboradores-agenticos\/$/);
  await expect(page.locator('h1')).toContainText('Sua empresa cresce.');
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
  await expect(page.locator('.agent-delivery-step')).toHaveCount(3);
  const missing = await page
    .locator('a[href^="#"], a[href^="/#"]')
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute('href')!)
        .filter(
          (href) =>
            href.startsWith('#') && !document.getElementById(decodeURIComponent(href.slice(1))),
        ),
    );
  expect(missing).toEqual([]);
  await expect(
    page.locator('.footer-nav').getByRole('link', { name: 'Serviços', exact: true }),
  ).toHaveAttribute('href', '/#servicos');
  await expect(
    page.locator('.footer-nav').getByRole('link', { name: 'Contato', exact: true }),
  ).toHaveAttribute('href', '#contato');
  await page.getByRole('link', { name: 'Conhecer os resultados', exact: true }).click();
  await expect(page).toHaveURL(/#resultados$/);
  await page.getByRole('button', { name: 'Próxima aplicação', exact: true }).click();
  await expect(page.locator('.circular-carousel-card[data-active="true"]')).toContainText(
    'Pedidos e atendimento',
  );
  await page.getByRole('button', { name: 'Próxima aplicação', exact: true }).press('ArrowLeft');
  await expect(page.locator('.circular-carousel-card[data-active="true"]')).toContainText(
    'Financeiro e faturamento',
  );
  for (const width of [1449, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 930 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `overflow at ${width}`,
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '';
  });
  await page.setViewportSize(initialViewport);
  await page.screenshot({
    path: `artifacts/agent-e-${test.info().project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator('h1')).toBeVisible();
  expect(errors).toEqual([]);
});
