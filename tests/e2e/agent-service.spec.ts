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
  await expect(page.locator('h1')).toContainText('Um agente sob medida que assume');
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

test('approved service journey, illustrative cases and financial reconciliation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://prod.spline.design/**', (route) => route.abort());
  await page.goto('/colaboradores-agenticos/', { waitUntil: 'domcontentloaded' });
  // MotionRoot signals readiness after the local fonts finish loading.
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  expect(
    await page
      .locator('.agent-service-content > section')
      .evaluateAll((sections) => sections.map((section) => section.id)),
  ).toEqual([
    'beneficios',
    'como-atuam',
    'remuneracao',
    'resultados',
    'aplicacoes',
    'eficiencia',
    'contratacao-e-entrega',
  ]);
  const carousel = page.getByRole('region', { name: 'Cases ilustrativos' });
  await carousel.scrollIntoViewIfNeeded();
  await expect(carousel.locator('article[aria-hidden="false"]')).toContainText(
    'Distribuidora Exemplo A',
  );
  const slideBounds = await carousel.locator('article').evaluateAll((slides) =>
    slides.map((slide) => {
      const box = slide.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }),
  );
  expect(slideBounds[1].left).toBeGreaterThan(slideBounds[0].right);
  expect(slideBounds[2].right).toBeLessThan(slideBounds[0].left);
  await carousel.getByRole('button', { name: 'Próximo case', exact: true }).click();
  await expect(carousel.locator('article[aria-hidden="false"]')).toContainText(
    'Indústria Exemplo B',
  );
  await carousel.getByRole('button', { name: 'Próximo case', exact: true }).press('ArrowLeft');
  await expect(carousel.locator('article[aria-hidden="false"]')).toContainText(
    'Distribuidora Exemplo A',
  );
  await expect(page.locator('.agent-finance-demo')).toContainText('Conciliado');
  await expect(page.locator('.agent-finance-demo')).toContainText('R$ 1.250,00');
});

test('illustrative cases support pagination and drag without video controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('https://prod.spline.design/**', (route) => route.abort());
  await page.goto('/colaboradores-agenticos/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  const carousel = page.getByRole('region', { name: 'Cases ilustrativos', exact: true });
  await carousel.scrollIntoViewIfNeeded();
  await carousel.getByRole('button', { name: 'Case 3: Comércio Exemplo C', exact: true }).click();
  await expect(carousel.locator('article[aria-hidden="false"]')).toContainText(
    'Comércio Exemplo C',
  );
  const viewport = carousel.locator('.testimonial-viewport');
  const bounds = (await viewport.boundingBox())!;
  const x = bounds.x + bounds.width * 0.75;
  const y = Math.max(10, bounds.y + Math.min(bounds.height / 2, 150));
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - bounds.width * 0.7, y, { steps: 12 });
  await page.mouse.up();
  await expect(carousel.locator('article[aria-hidden="false"]')).toContainText(
    'Distribuidora Exemplo A',
  );
  await expect(carousel.locator('video, .testimonial-play')).toHaveCount(0);
});

test('financial illustration advances automatically and reconciles the same amount', async ({
  page,
}) => {
  await page.route('https://prod.spline.design/**', (route) => route.abort());
  await page.goto('/colaboradores-agenticos/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true', { timeout: 30_000 });
  const demo = page.locator('.agent-finance-demo');
  await demo.scrollIntoViewIfNeeded();
  await expect(demo).toHaveAttribute('data-step', '3', { timeout: 20000 });
  await expect(demo.locator('.agent-finance-status')).toHaveText('Conciliado');
  await expect(demo.locator('.agent-finance-total')).toHaveText('R$ 1.250,00');
});

test('operation tabs switch examples and support keyboard navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/colaboradores-agenticos/', { waitUntil: 'domcontentloaded' });
  const demo = page.locator('.agent-finance-demo');
  await demo.scrollIntoViewIfNeeded();
  await demo.getByRole('tab', { name: 'Produção', exact: true }).click();
  await expect(demo.getByRole('tabpanel')).toContainText('Ordens de produção');
  await expect(demo.getByRole('tabpanel')).toContainText('Unidades programadas neste fluxo');
  await expect(demo.getByRole('tabpanel')).not.toContainText('BRL');
  await expect(demo.getByRole('tabpanel')).toContainText('materiais disponíveis');
  await demo.getByRole('tab', { name: 'Produção', exact: true }).press('ArrowRight');
  await expect(demo.getByRole('tab', { name: 'Pedidos', exact: true })).toBeFocused();
  await expect(demo.getByRole('tabpanel')).toContainText('Pedido #0842');
  await demo.getByRole('tab', { name: 'Pedidos', exact: true }).press('End');
  await expect(demo.getByRole('tabpanel')).toContainText('Chamado #0318');
  await demo.getByRole('tab', { name: 'Financeiro', exact: true }).click();
  await expect(demo.locator('.agent-finance-total')).toHaveText('R$ 1.250,00');
});
