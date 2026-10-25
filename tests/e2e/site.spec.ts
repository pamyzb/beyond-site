import { test, expect, type Page, type Locator } from '@playwright/test';

const runtimeErrors = new WeakMap<Page, string[]>();
const phoneArtwork = '.component-art.app-drawn-art';

function screenAppearance(phone: Locator) {
  return phone
    .locator('[data-screen-source] :is(rect,path,circle,ellipse,line,polyline,polygon,text,image)')
    .evaluateAll((items) =>
      items
        .filter((el) => !el.closest('defs,clipPath,mask,pattern,symbol,[data-screen-trace]'))
        .map((el) => {
          const style = getComputedStyle(el);
          let effectiveOpacity = Number(style.opacity);
          let displayed = style.display !== 'none';
          // Opacity is not inherited: a transparent SVG/group hides its children
          // while their computed opacity remains 1. Include the full ancestor chain.
          for (let parent = el.parentElement; parent; parent = parent.parentElement) {
            const ancestor = getComputedStyle(parent);
            effectiveOpacity *= Number(ancestor.opacity);
            displayed &&= ancestor.display !== 'none';
          }
          return {
            tag: el.tagName,
            opacity: Math.round(Number(style.opacity) * 10000) / 10000,
            display: style.display,
            visibility: style.visibility,
            effectiveOpacity: Math.round(effectiveOpacity * 10000) / 10000,
            displayed,
          };
        }),
    );
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  // Each scenario also catches hydration failures and uncaught animation errors.
  runtimeErrors.set(page, errors);
  await page.evaluate(() => document.fonts.ready);
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([]);
});

test('theme changes at the conversation boundary and returns when scrolling back', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const root = page.locator('html');
  await expect(root).toHaveAttribute('data-ready', 'true');
  for (const [offset, theme] of [
    [-100, 'light'],
    [100, 'dark'],
    [-100, 'light'],
  ] as const) {
    await page.locator('#conversa').evaluate((section, offset) => {
      window.scrollTo({
        top: section.getBoundingClientRect().bottom + scrollY - innerHeight + offset,
        behavior: 'instant',
      });
    }, offset);
    await expect(root).toHaveAttribute('data-scroll-theme', theme);
  }
});

test('services carousel supports Home, End and arrow keys', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const carousel = page.getByRole('region', { name: 'Serviços', exact: true });
  const firstCardVisible = () =>
    carousel.evaluate((el) => {
      const viewport = el.getBoundingClientRect();
      const card = el.querySelector('article')!.getBoundingClientRect();
      return card.left >= viewport.left - 1 && card.right <= viewport.right + 1;
    });
  await carousel.scrollIntoViewIfNeeded();
  await carousel.focus();
  await page.keyboard.press('End');
  await expect
    .poll(() =>
      carousel.evaluate((el) => Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft)),
    )
    .toBeLessThan(2);
  await page.keyboard.press('Home');
  // Native scroll snap can retain a small inset; assert the user's full first card.
  await expect.poll(firstCardVisible).toBe(true);
  await page.keyboard.press('ArrowRight');
  await expect.poll(firstCardVisible).toBe(false);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(firstCardVisible).toBe(true);
});

test('FAQ opens one answer at a time and supports keyboard toggling', async ({ page }) => {
  const questions = page.locator('.faq-question');
  await expect(questions).toHaveCount(6);
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'true');
  await questions.nth(1).click();
  await expect(questions.nth(0)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#faq-answer-0')).toHaveAttribute('inert', '');
  await expect(questions.nth(1)).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#faq-answer-1')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#faq-answer-1')).not.toHaveAttribute('inert', '');
  await questions.nth(1).focus();
  await page.keyboard.press('Enter');
  await expect(questions.nth(1)).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Space');
  await expect(questions.nth(1)).toHaveAttribute('aria-expanded', 'true');
});

test('contact validates fields, masks phone and resets after simulated submission', async ({
  page,
}) => {
  const form = page.locator('form.contact-form');
  const submit = form.getByRole('button', { name: 'Fale com um sócio da Beyond' });
  await submit.click();
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(5);
  await expect(form.locator('[name="name"]')).toBeFocused();
  await form.locator('[name="name"]').fill('Teste automatizado');
  await form.locator('[name="company"]').fill('Empresa teste');
  await form.locator('[name="project"]').fill('Validar o protótipo local.');
  await form.locator('[name="phone"]').fill('123');
  await form.locator('[name="email"]').fill('invalido');
  await submit.click();
  await expect(form.getByText('Informe o celular com DDD e 9 dígitos.')).toBeVisible();
  await expect(form.getByText('Informe um e-mail válido.')).toBeVisible();
  await form.locator('[name="phone"]').fill('11987654321');
  await expect(form.locator('[name="phone"]')).toHaveValue('(11) 98765-4321');
  await form.locator('[name="email"]').fill('teste@example.com');
  await expect(form.locator('[aria-invalid="true"]')).toHaveCount(0);
  await submit.click();
  await expect(form).toHaveAttribute('aria-busy', 'true');
  await expect(form.locator('button[type="submit"]')).toBeDisabled();
  await expect(form.locator('input:enabled, textarea:enabled')).toHaveCount(0);
  const success = page.getByRole('heading', { name: 'Mensagem enviada!' });
  await expect(success).toBeVisible();
  await expect(success).toBeFocused();
  await page.getByRole('button', { name: 'Enviar outra mensagem' }).click();
  await expect(form.locator('[name="name"]')).toBeFocused();
  for (const name of ['name', 'company', 'phone', 'email', 'project']) {
    await expect(form.locator(`[name="${name}"]`)).toHaveValue('');
  }
});

test('navigation hydrates and the compact menu opens and closes', async ({ page }) => {
  const toggle = page.getByRole('button', { name: /^(Abrir|Fechar) menu$/ });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // Safari does not focus buttons on a pointer click; keyboard users focus first.
    await toggle.focus();
    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  } else {
    await expect(page.locator('.header-content nav')).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
});

test('hero motion runs, pauses offscreen and respects reduced motion', async ({ page }) => {
  const lens = page.locator('.hero-glass');
  const compact = (page.viewportSize()?.width ?? 1440) < 1440;
  await expect(lens).toHaveAttribute('data-motion-mode', compact ? 'auto' : 'pointer');
  if (!compact) await page.mouse.move(700, 300);
  await expect(lens).toHaveAttribute('data-motion-state', 'running');
  const transform = await lens.evaluate((el) => el.style.transform);
  if (!compact) await page.mouse.move(1000, 550);
  await expect.poll(() => lens.evaluate((el) => el.style.transform)).not.toBe(transform);
  await page.locator('#servicos').scrollIntoViewIfNeeded();
  await expect(lens).toHaveAttribute('data-motion-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(lens).toHaveAttribute('data-motion-mode', 'reduced');
  await expect(lens).toHaveAttribute('data-motion-state', 'reduced');
});

test('Sobre preserves the corrected block icon after server artwork assembly', async ({ page }) => {
  const glyph = page
    .locator('.section-sobre .about-panel-card')
    .nth(1)
    .locator('[data-artwork-role="about-glyph"]');
  await expect(glyph).toHaveCount(1);
  await expect(glyph).toHaveAttribute('id', 'about-17-lucide/blocks');
  await expect(glyph).toHaveAttribute('data-artwork-role', 'about-glyph');
  await expect(glyph.locator('rect')).toHaveCount(4);
  await expect(glyph.locator('path')).toHaveCount(0);
  const blocks = await glyph.locator('rect').evaluateAll((items) =>
    items.map((rect) => ({
      x: rect.getAttribute('x'),
      y: rect.getAttribute('y'),
      width: rect.getAttribute('width'),
      height: rect.getAttribute('height'),
    })),
  );
  expect(blocks).toEqual([
    { x: '564.667', y: '8961.25', width: '10.667', height: '10.667' },
    { x: '564.667', y: '8971.92', width: '10.667', height: '10.667' },
    { x: '575.334', y: '8971.92', width: '10.667', height: '10.667' },
    { x: '580.667', y: '8955.92', width: '10.667', height: '10.667' },
  ]);
});

test('carousel controls stay below compact cards and builders remain visible on every group', async ({
  page,
}) => {
  const carousel = page.getByRole('region', { name: 'Serviços', exact: true });
  const builders = carousel.locator('.services-rail > .builder');
  await expect(builders).toHaveCount(2);
  await carousel.scrollIntoViewIfNeeded();
  for (let group = 1; group <= 3; group++) {
    const button = page.getByRole('button', {
      name: `Ir para o grupo ${group} de 3 de serviços`,
      exact: true,
    });
    await button.click();
    await expect(button).toHaveAttribute('aria-current', 'true');
    await expect(builders).toHaveCount(2);
    await expect(builders.nth(0)).toBeVisible();
    await expect(builders.nth(1)).toBeVisible();
    // Wait for scroll and route interpolation to settle, using visible geometry.
    if ((page.viewportSize()?.width ?? 1440) < 1440) {
      await expect
        .poll(() =>
          page.evaluate(() => {
            const viewport = document.querySelector('.services-window')!.getBoundingClientRect();
            const nav = document.querySelector('.services-navigation')!.getBoundingClientRect();
            const robots = [...document.querySelectorAll('.services-rail > .builder')].map((el) =>
              el.getBoundingClientRect(),
            );
            return (
              nav.top >= viewport.bottom - 1 &&
              robots.length === 2 &&
              robots.every(
                (box) =>
                  box.width > 0 &&
                  box.left >= viewport.left - 1 &&
                  box.right <= viewport.right + 1 &&
                  box.top >= viewport.top - 1 &&
                  box.bottom <= viewport.bottom + 1,
              )
            );
          }),
        )
        .toBe(true);
    }
  }
});

test('both phone screens finish drawing and restore all original content', async ({ page }) => {
  // Capture the complete, unanimated artwork as the expected final appearance.
  // Comparing every original element also catches a partially blank lower screen.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const artworks = page.locator(phoneArtwork);
  await expect(artworks).toHaveCount(2);
  const expected = [];
  for (let index = 0; index < 2; index++) {
    const appearance = await screenAppearance(artworks.nth(index));
    expect(appearance.length).toBeGreaterThan(0);
    expect(
      appearance.some(
        (item) =>
          item.tag === 'text' &&
          item.displayed &&
          item.visibility === 'visible' &&
          item.effectiveOpacity > 0,
      ),
    ).toBe(true);
    expected.push(appearance);
  }

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const traceCounts = [];
  for (let index = 0; index < 2; index++) {
    const artwork = artworks.nth(index);
    await expect(artwork.locator('[data-artwork-role="phone-camera"]')).toHaveCSS('opacity', '0');
    const traces = artwork.locator('[data-screen-trace]');
    await expect.poll(() => traces.count()).toBeGreaterThan(0);
    traceCounts.push(await traces.count());
    expect(
      await traces.evaluateAll((items) =>
        items.every((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset) > 0),
      ),
    ).toBe(true);
  }

  for (let index = 0; index < 2; index++) {
    const artwork = artworks.nth(index);
    await artwork.scrollIntoViewIfNeeded();
    const traces = artwork.locator('[data-screen-trace]');
    await expect(traces).toHaveCount(traceCounts[index]);
    await expect
      .poll(() =>
        traces.evaluateAll(
          (items) =>
            items.length > 0 &&
            items.every((el) => {
              const style = getComputedStyle(el);
              return Number.parseFloat(style.strokeDashoffset) === 0 && Number(style.opacity) === 0;
            }),
        ),
      )
      .toBe(true);
    await expect(artwork.locator('[data-artwork-role="phone-camera"]')).toHaveCSS('opacity', '1');
    await expect.poll(() => screenAppearance(artwork)).toEqual(expected[index]);
  }
});

test('reduced motion keeps the phone content visible without drawing clones', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  const phones = page.locator(`${phoneArtwork} [data-artwork-role="phone"]`);
  await expect(phones).toHaveCount(2);
  for (let index = 0; index < 2; index++) {
    const phone = phones.nth(index);
    await phone.scrollIntoViewIfNeeded();
    await expect(phone.locator('[data-artwork-role="phone-camera"]')).toHaveCSS('opacity', '1');
    await expect(phone.locator('[data-screen-trace]')).toHaveCount(0);
    expect(
      (await screenAppearance(phone)).filter(
        (item) =>
          item.tag === 'text' &&
          item.displayed &&
          item.visibility === 'visible' &&
          item.effectiveOpacity > 0,
      ).length,
    ).toBeGreaterThan(0);
  }
});
