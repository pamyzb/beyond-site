const {chromium}=require('@playwright/test');
(async()=>{const b=await chromium.launch({channel:'chrome'});const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const width of [390,1024,320,1440]){
 await p.setViewportSize({width,height:900});await p.goto('http://127.0.0.1:4173/');await p.locator('.process-card-entry').first().scrollIntoViewIfNeeded();await p.waitForTimeout(2600);
 const start=await p.locator('[data-artwork-role="process-marker"]').getAttribute('transform');
 await p.evaluate(()=>window.scrollBy(0,200));await p.waitForTimeout(1000);
 const end=await p.locator('[data-artwork-role="process-marker"]').getAttribute('transform');
 console.log({width,moved:start!==end,visible:await p.locator('.process-marker-layer').isVisible(),path:await p.locator('.process-route').getAttribute('d')});
 await p.locator('#processo').screenshot({path:`artifacts/route-${width}.png`});
} console.log({errors});await b.close()})();
