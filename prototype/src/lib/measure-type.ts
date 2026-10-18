/** Preserve Figma line geometry after local fonts finish loading. */
export function measureType(scope: HTMLElement) {
  const ctx=document.createElement('canvas').getContext('2d');
  if(!ctx)return;
  scope.querySelectorAll<HTMLElement>('.text-block').forEach(block=>{
    let width=0,height=0;
    block.querySelectorAll<HTMLElement>('.text-run').forEach(run=>{
      const style=getComputedStyle(run),size=Number(run.dataset.size);
      ctx.font=`${style.fontStyle} ${style.fontWeight} ${size}px Poppins`;
      const spacing=style.letterSpacing==='normal'?0:parseFloat(style.letterSpacing);
      const text=run.dataset.measureText ?? run.textContent ?? '';
      const measured=ctx.measureText(text).width+spacing*Math.max(0,text.length-1);
      width=Math.max(width,parseFloat(run.style.left)+measured);
      height=Math.max(height,parseFloat(run.style.top)+size);
    });
    block.style.setProperty('--block-width',`${Math.ceil(width)}px`);
    block.style.setProperty('--block-height',`${Math.ceil(height)}px`);
  });
}
