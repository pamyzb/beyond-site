const {chromium}=require('@playwright/test');
(async()=>{
const b=await chromium.launch({channel:'chrome'});
const p=await b.newPage({reducedMotion:'reduce'});
for(const width of [1440,1328,1024,768,390,320]){
await p.setViewportSize({width,height:1000});
await p.goto('http://127.0.0.1:4173/');
await p.locator('#processo').scrollIntoViewIfNeeded();
await p.screenshot({path:`artifacts/process-${width}.png`});
console.log(width,await p.locator('.process-card').evaluateAll(cs=>cs.map(c=>{const r=c.getBoundingClientRect(),s=getComputedStyle(c),t=c.querySelector('.process-card-copy');return {width:r.width,height:r.height,zoom:s.zoom,art:getComputedStyle(c.querySelector('.process-card-art')).display,font:getComputedStyle(t).fontSize,left:r.left,right:r.right}})));
}
await b.close();
})();
