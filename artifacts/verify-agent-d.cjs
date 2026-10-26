const { chromium } = require('@playwright/test');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 const page = await browser.newPage({reducedMotion:'reduce'});
 for (const width of [1449,768,390,320]) {
  await page.setViewportSize({width,height:1000});
  await page.goto('http://127.0.0.1:4173/colaboradores-agenticos/');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#contratacao-e-entrega').scrollIntoViewIfNeeded();
  await page.locator('#contratacao-e-entrega').screenshot({path:`artifacts/agent-d-${width}.png`});
  if(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow ${width}`);
  if(await page.locator('.agent-delivery-step').count() !== 3) throw new Error('Missing steps');
  console.log(`OK ${width}`);
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(() => document.documentElement.style.fontSize = '200%');
 if(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Font overflow');
 console.log('OK fonte 200%');
 await browser.close();
})();
