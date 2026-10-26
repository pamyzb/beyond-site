const { chromium } = require('@playwright/test');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const page = await browser.newPage({reducedMotion:'reduce'});
 for (const width of [1449,768,390,320]) {
  await page.setViewportSize({width,height:930});
  await page.goto('http://127.0.0.1:4173/colaboradores-agenticos/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#resultados').scrollIntoViewIfNeeded();
  await page.screenshot({path:`artifacts/agent-c-results-${width}.png`});
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  if(overflow) throw new Error(`Overflow ${width}`);
  if(await page.locator('.agent-result-sector').count() !== 2) throw new Error('Missing sectors');
  if(await page.locator('.agent-application').count() !== 4) throw new Error('Missing applications');
  await page.locator('#aplicacoes').scrollIntoViewIfNeeded();
  await page.screenshot({path:`artifacts/agent-c-applications-${width}.png`});
  console.log(`OK ${width}`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(() => document.documentElement.style.fontSize = '200%');
 if(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Font overflow');
 await page.locator('a[href="#resultados"]').click();
 await page.waitForURL('**/#resultados');
 console.log('OK fonte 200% e CTA');
 await browser.close();
})();
