import { test, expect, type Locator } from '@playwright/test';

// Pinned sections above the carousel can refresh after the first scroll.
// Recompute its actual document position until the intended viewport is reached.
async function revealCarousel(carousel: Locator) {
  await expect
    .poll(async () =>
      carousel.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const target = Math.max(0, (innerHeight - Math.min(bounds.height, innerHeight)) / 2);
        if (Math.abs(bounds.top - target) > 3) {
          window.scrollTo({ top: scrollY + bounds.top - target, behavior: 'instant' });
          return false;
        }
        return bounds.bottom > 0 && bounds.top < innerHeight;
      }),
    )
    .toBe(true);
  await expect(carousel.locator('.testimonial-viewport')).toHaveCSS('opacity', '1');
}
type Metrics = { draws: number; uploads: number; contexts: number };
type Instrumented = Window & { glassMetrics: Metrics };
type FailedGpu = Window & { failedGpu: { checks: number; deletedTextures: number } };

test('compact glass enters the card edges during navigation and returns to a crisp resting card', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 960, 'Compact layout only');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  await revealCarousel(carousel);
  await carousel.getByRole('button', { name: 'Próximo depoimento', exact: true }).focus();
  await expect(carousel).toHaveAttribute('data-glass-renderer', 'webgl');
  const window = carousel.locator('.testimonial-reading-window');
  await expect(carousel.locator('.testimonial-video-poster')).toHaveCSS('filter', 'none');
  expect(
    await carousel
      .locator('.testimonial-text')
      .first()
      .evaluate((el) => getComputedStyle(el, '::before').filter),
  ).toBe('none');
  const peak = await carousel.evaluate(
    (el) =>
      new Promise<number>((resolve) => {
        const reading = el.querySelector<HTMLElement>('.testimonial-reading-window')!;
        let peak = 0;
        let frame = 0;
        const inspect = () => {
          peak = Math.max(
            peak,
            parseFloat(reading.style.getPropertyValue('--testimonial-lens-inset')) || 0,
          );
          frame = requestAnimationFrame(inspect);
        };
        el.querySelector<HTMLButtonElement>('.testimonial-next')!.click();
        frame = requestAnimationFrame(inspect);
        setTimeout(() => {
          cancelAnimationFrame(frame);
          resolve(peak);
        }, 1400);
      }),
  );
  expect(
    peak,
    'Refraction reaches inside narrow cards instead of disappearing beyond the screen',
  ).toBeGreaterThan(45);
  await expect(window).toHaveCSS('--testimonial-lens-inset', '0px');
});

test('compact testimonial cards share attribution size and preserve desktop artwork', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 1440) >= 960, 'Compact layout only');
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  await revealCarousel(carousel);
  const layout = await carousel.evaluate((element) => {
    const text = element.querySelector<HTMLElement>('.testimonial-text')!;
    const video = element.querySelector<HTMLElement>('.testimonial-video')!;
    const card = text.getBoundingClientRect();
    const quote = text.querySelector('blockquote')!.getBoundingClientRect();
    const person = text.querySelector('.testimonial-person')!.getBoundingClientRect();
    return {
      textName: getComputedStyle(text.querySelector('strong')!).fontSize,
      videoName: getComputedStyle(video.querySelector('strong')!).fontSize,
      mark: getComputedStyle(text, '::before').backgroundImage,
      markSize: getComputedStyle(text, '::before').backgroundSize,
      contentFits: quote.top >= card.top && person.bottom <= card.bottom,
    };
  });
  expect(layout.textName).toBe(layout.videoName);
  expect(layout.mark).toContain('/assets/depoimentos/testimonial-outline.svg');
  expect(layout.markSize).toContain('85% auto');
  expect(layout.contentFits).toBe(true);
});

test('failed GPU draws release textures and stop retrying while HTML navigation continues', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const metrics = { checks: 0, deletedTextures: 0 };
    (window as unknown as FailedGpu).failedGpu = metrics;
    WebGLRenderingContext.prototype.getError = function () {
      metrics.checks++;
      return this.OUT_OF_MEMORY;
    };
    const original = WebGLRenderingContext.prototype.deleteTexture;
    WebGLRenderingContext.prototype.deleteTexture = function (texture) {
      metrics.deletedTextures++;
      return original.call(this, texture);
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  await revealCarousel(carousel);
  const next = carousel.getByRole('button', { name: 'Próximo depoimento', exact: true });
  await next.focus();
  const metrics = () => page.evaluate(() => (window as unknown as FailedGpu).failedGpu);
  await expect.poll(metrics).toEqual({ checks: 1, deletedTextures: 2 });
  await expect(carousel).toHaveAttribute('data-glass-renderer', 'fallback');
  await expect(carousel.locator('canvas')).toBeHidden();
  await expect(carousel.locator('.testimonial-reading-window')).toHaveCSS('mask-image', 'none');
  await page.evaluate(() => dispatchEvent(new Event('resize')));
  await next.click();
  await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveAttribute(
    'aria-label',
    /^2 de 3/,
  );
  await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveCSS(
    'transform',
    /matrix\(1, 0, 0, 1, 0, 0\)/,
  );
  expect(await metrics()).toEqual({ checks: 1, deletedTextures: 2 });
});

test('GPU glass remains continuous during navigation, caches textures and keeps the center sharp', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const metrics = { draws: 0, uploads: 0, contexts: 0 };
    (window as unknown as Instrumented).glassMetrics = metrics;
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, ...args: unknown[]) {
        if (args[0] === 'webgl') metrics.contexts++;
        return Reflect.apply(getContext, this, args);
      },
    });
    for (const [method, counter] of [
      ['drawArrays', 'draws'],
      ['texImage2D', 'uploads'],
    ] as const) {
      const original = WebGLRenderingContext.prototype[method];
      Object.defineProperty(WebGLRenderingContext.prototype, method, {
        value: function (this: WebGLRenderingContext, ...args: unknown[]) {
          metrics[counter]++;
          return Reflect.apply(original, this, args);
        },
      });
    }
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const metrics = () => page.evaluate(() => (window as unknown as Instrumented).glassMetrics);
  expect((await metrics()).contexts).toBe(0);
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  const canvas = carousel.locator('.testimonial-glass-canvas');
  const track = carousel.locator('.testimonial-track');
  const stage = carousel.locator('.testimonial-viewport');
  const next = carousel.getByRole('button', { name: 'Próximo depoimento', exact: true });
  await revealCarousel(carousel);
  await next.focus();
  await expect(track).toHaveCSS('filter', 'none');
  await expect(carousel.locator('feDisplacementMap')).toHaveCount(0);
  {
    await expect(carousel).toHaveAttribute('data-glass-renderer', 'webgl');
    await expect(canvas).toBeVisible();
    await expect(stage).toHaveCSS('opacity', '1');
    await expect(stage).toHaveCSS('transform', /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    const loaded = await metrics();
    expect(loaded.contexts).toBe(1);
    expect(loaded.uploads).toBe(2);
    expect(loaded.draws).toBeGreaterThan(0);
    await page.evaluate(() => {
      dispatchEvent(new Event('resize'));
      dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(350);
    expect(await metrics(), 'Idle/unchanged resize must not redraw or upload textures').toEqual(
      loaded,
    );
    const scrollFrames = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          const origin = scrollY;
          let start = 0,
            frames = 0;
          const scroll = (time: number) => {
            if (!start) start = time;
            frames++;
            window.scrollTo(0, origin + Math.sin(((time - start) / 1000) * Math.PI * 2) * 40);
            if (time - start < 1000) requestAnimationFrame(scroll);
            else {
              window.scrollTo(0, origin);
              resolve(frames);
            }
          };
          requestAnimationFrame(scroll);
        }),
    );
    expect(scrollFrames).toBeGreaterThan(1);
    expect(
      await metrics(),
      'Scrolling reuses the canvas without GPU draws or texture uploads',
    ).toEqual(loaded);
    const quote = carousel.locator('.testimonial-text blockquote').first();
    const portrait = carousel.locator('.testimonial-text .testimonial-portrait').first();
    const quotePixels = await quote.screenshot();
    const portraitPixels = await portrait.screenshot();
    try {
      await canvas.evaluate((el) => ((el as HTMLElement).style.visibility = 'hidden'));
      expect(
        (await quote.screenshot()).equals(quotePixels),
        'GPU overlay leaves the quote pixels unchanged',
      ).toBe(true);
      expect(
        (await portrait.screenshot()).equals(portraitPixels),
        'GPU overlay leaves the portrait pixels unchanged',
      ).toBe(true);
    } finally {
      await canvas.evaluate((el) => (el as HTMLElement).style.removeProperty('visibility'));
    }
    await page.screenshot({ path: info.outputPath('resting-glass.png') });
    const transition = await carousel.evaluate(
      (el) =>
        new Promise<{ frames: number; missing: boolean; filteredCenter: boolean }>((resolve) => {
          let frames = 0,
            missing = false,
            filteredCenter = false,
            frame = 0;
          const inspect = () => {
            frames++;
            missing ||=
              (el.querySelector('canvas') as HTMLCanvasElement).hidden ||
              (el as HTMLElement).dataset.glassRenderer !== 'webgl';
            filteredCenter ||= [
              ...el.querySelectorAll(
                '.testimonial-slide, .testimonial-surface, .testimonial-track',
              ),
            ].some((card) => getComputedStyle(card).filter !== 'none');
            frame = requestAnimationFrame(inspect);
          };
          el.querySelector<HTMLButtonElement>('.testimonial-next')!.click();
          frame = requestAnimationFrame(inspect);
          setTimeout(() => {
            cancelAnimationFrame(frame);
            resolve({ frames, missing, filteredCenter });
          }, 1500);
        }),
    );
    expect(transition.frames).toBeGreaterThan(1);
    expect(transition.missing, 'Glass never switches off mid-transition').toBe(false);
    expect(transition.filteredCenter).toBe(false);
    expect((await metrics()).uploads).toBe(loaded.uploads);
    expect((await metrics()).draws).toBeGreaterThan(loaded.draws + 1);
    await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveAttribute(
      'aria-label',
      /^2 de 3/,
    );
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(canvas).toBeHidden();
    const paused = await metrics();
    await page.waitForTimeout(350);
    expect(await metrics()).toEqual(paused);
    await page.evaluate(() => {
      Reflect.deleteProperty(document, 'hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect(canvas).toBeVisible();
    await page.locator('#inicio').scrollIntoViewIfNeeded();
    await expect(canvas).toBeHidden();
    await revealCarousel(carousel);
    await expect(canvas).toBeVisible();
    expect((await metrics()).uploads).toBe(2);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(canvas).toBeHidden();
  await next.click();
  await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveAttribute(
    'aria-label',
    /^3 de 3/,
  );
  expect(errors).toEqual([]);
});

test('carousel remains readable and navigable without WebGL', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, ...args: unknown[]) {
        return args[0] === 'webgl' ? null : Reflect.apply(original, this, args);
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  await revealCarousel(carousel);
  await expect(carousel.locator('canvas')).toBeHidden();
  await expect(carousel.locator('.testimonial-track')).toHaveCSS('clip-path', 'none');
  await expect(carousel.locator('.testimonial-reading-window')).toHaveCSS('mask-image', 'none');
  await carousel.getByRole('button', { name: 'Próximo depoimento', exact: true }).click();
  await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveAttribute(
    'aria-label',
    /^2 de 3/,
  );
});

test('HTML fallback preview disables only testimonial glass and remains navigable', async ({
  page,
}, info) => {
  await page.goto('/?testimonialGlass=off');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  await revealCarousel(carousel);
  const next = carousel.getByRole('button', { name: 'Próximo depoimento', exact: true });
  await next.focus();
  await expect(carousel).toHaveAttribute('data-glass-renderer', 'fallback');
  await expect(carousel.locator('canvas')).toBeHidden();
  await expect(carousel.locator('.testimonial-reading-window')).toHaveCSS('mask-image', 'none');
  await expect(carousel.locator('.testimonial-viewport')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: info.outputPath('html-fallback.png') });
  await next.click();
  await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveAttribute(
    'aria-label',
    /^2 de 3/,
  );
});

test('GPU context loss restores the HTML carousel', async ({ page }, info) => {
  test.skip(
    info.project.name !== 'desktop-chromium',
    'Exercise the loss extension on desktop Chromium',
  );
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-ready', 'true');
  const carousel = page.getByRole('region', { name: 'Depoimentos de clientes', exact: true });
  await revealCarousel(carousel);
  await carousel.getByRole('button', { name: 'Próximo depoimento', exact: true }).focus();
  await expect(carousel).toHaveAttribute('data-glass-renderer', 'webgl');
  await carousel.locator('canvas').evaluate((canvas) => {
    (canvas as HTMLCanvasElement)
      .getContext('webgl')!
      .getExtension('WEBGL_lose_context')!
      .loseContext();
  });
  await expect(carousel).toHaveAttribute('data-glass-renderer', 'fallback');
  await expect(carousel.locator('canvas')).toBeHidden();
  await expect(carousel.locator('.testimonial-track')).toHaveCSS('clip-path', 'none');
  await expect(carousel.locator('.testimonial-reading-window')).toHaveCSS('mask-image', 'none');
  await carousel.getByRole('button', { name: 'Próximo depoimento', exact: true }).click();
  await expect(carousel.locator('.testimonial-slide[aria-hidden="false"]')).toHaveAttribute(
    'aria-label',
    /^2 de 3/,
  );
});
