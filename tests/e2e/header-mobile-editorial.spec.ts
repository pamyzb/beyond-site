import { test, expect } from '@playwright/test';

test('compact menu draws its mark, labels languages and reverses item exit', async ({
  page,
}, info) => {
  test.skip(!info.project.name.startsWith('mobile'), 'Responsive menu');
  await page.goto('/');
  await page.locator('html[data-ready=true]').waitFor();
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  const mark = page.locator('.site-header:not(.hero-header-reveal) .menu-background-mark path');
  await page.waitForTimeout(700);
  const drawing = await mark.evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset));
  expect(drawing).toBeGreaterThan(0);
  await expect
    .poll(() => mark.evaluate((e) => parseFloat(getComputedStyle(e).strokeDashoffset)))
    .toBe(0);
  const language = page.locator('.site-header:not(.hero-header-reveal) .language-trigger');
  await expect(language).toHaveText(/Português/);
  await expect(language.locator('.language-full')).toHaveCSS('gap', '8px');
  await language.click();
  const popup = page.locator('#language-options');
  await expect(popup.getByRole('menuitemradio', { name: /English/ })).toBeVisible();
  expect(
    (await popup.getByRole('menuitemradio', { name: /English/ }).boundingBox())!.height,
  ).toBeGreaterThanOrEqual(56);
  expect(
    Math.abs((await popup.boundingBox())!.width - (await language.boundingBox())!.width),
  ).toBeLessThan(2);
  await popup.getByRole('menuitemradio', { name: /English/ }).click();
  await expect(language).toHaveText(/English/);
  const exitSamples = await page.getByRole('button', { name: 'Fechar menu', exact: true }).evaluate(
    (button) =>
      new Promise<number[][]>((resolve) => {
        (button as HTMLButtonElement).click();
        const start = performance.now();
        const samples: number[][] = [];
        const frame = () => {
          samples.push(
            [
              ...document.querySelectorAll(
                '.site-header:not(.hero-header-reveal) .header-nav-link',
              ),
            ].map((e) => parseFloat(getComputedStyle(e).opacity)),
          );
          if (performance.now() - start < 400) requestAnimationFrame(frame);
          else resolve(samples);
        };
        requestAnimationFrame(frame);
      }),
  );
  expect(exitSamples.some((values) => values[0] > values[values.length - 1])).toBe(true);
  await expect(
    page.locator('.site-header:not(.hero-header-reveal) #mobile-navigation'),
  ).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
  await expect(mark).toHaveCSS('stroke-dashoffset', '0px');
});
