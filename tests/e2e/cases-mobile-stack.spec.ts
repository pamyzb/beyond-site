import { test, expect } from '@playwright/test';

test('mobile case windows expand and the next window rises over the previous one', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile scroll composition');
  await page.goto('/');
  await page.locator('html[data-ready=true]').waitFor();
  await page.evaluate(() => document.fonts.ready);
  const cards = page.locator('.case-mobile-sequence .case-sequence-window');
  const first = cards.nth(0);
  const second = cards.nth(1);
  const geometry = await first.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top + scrollY, bottom: r.bottom + scrollY, viewport: innerHeight };
  });
  const scroll = async (y: number) => {
    await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), y);
    await page.waitForTimeout(300);
  };
  await scroll(geometry.top - geometry.viewport * 0.8);
  const framed = await first.evaluate((el) => getComputedStyle(el).clipPath);
  await scroll(geometry.top - 80);
  const expanded = await first.evaluate((el) => getComputedStyle(el).clipPath);
  expect(expanded).not.toBe(framed);
  await scroll(geometry.bottom - geometry.viewport + 100);
  const reading = {
    first: await first.boundingBox(),
    second: await second.boundingBox(),
    action: await first.locator('.case-explore').boundingBox(),
  };
  expect(reading.action!.y).toBeGreaterThan(80);
  expect(reading.action!.y + reading.action!.height).toBeLessThanOrEqual(geometry.viewport);
  expect(reading.second!.y).toBeGreaterThan(geometry.viewport);
  await scroll(geometry.bottom - geometry.viewport + 700);
  const a = { first: await first.boundingBox(), second: await second.boundingBox() };
  await scroll(geometry.bottom - geometry.viewport + 1000);
  const b = { first: await first.boundingBox(), second: await second.boundingBox() };
  expect(Math.abs(a.first!.y - b.first!.y)).toBeLessThan(2);
  expect(a.second!.y - b.second!.y).toBeGreaterThan(250);
  expect(b.second!.y).toBeLessThan(b.first!.y + b.first!.height);
  const action = first.locator('.case-explore');
  const widths = await action.evaluate((el) => ({
    action: el.getBoundingClientRect().width,
    available:
      el.parentElement!.clientWidth -
      parseFloat(getComputedStyle(el.parentElement!).paddingLeft) -
      parseFloat(getComputedStyle(el.parentElement!).paddingRight),
  }));
  expect(Math.abs(widths.action - widths.available)).toBeLessThan(2);
  await page.screenshot({
    path: `artifacts/home-mobile/cases-overlap-${testInfo.project.name}.png`,
  });
});
