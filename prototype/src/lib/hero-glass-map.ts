// A continuous lens field for the hero, without a flat central reading area.
export function createHeroGlassMap(width:number,height:number) {
  const canvas=document.createElement('canvas');
  canvas.width=1024;
  canvas.height=1024;
  const context=canvas.getContext('2d');
  if(!context)return null;
  const regionWidth=width*2,regionHeight=height*2;
  const x=-width/2,y=-height/2;
  // Use the channel range efficiently to avoid coarse displacement steps.
  const scale=Math.max(width,height)*.085;
  const pixels=context.createImageData(canvas.width,canvas.height);
  for(let row=0;row<canvas.height;row++){
    const cy=y+row/(canvas.height-1)*regionHeight-height/2;
    for(let col=0;col<canvas.width;col++){
      const cx=x+col/(canvas.width-1)*regionWidth-width/2;
      const nx=cx/(width/2),ny=cy/(height/2);
      // Only subtle curvature here; CSS scales the live content for a sharper zoom.
      const strength=.025+.008*Math.cos(nx*Math.PI/2)*Math.cos(ny*Math.PI/2);
      const dx=-cx*strength+width*.003*Math.sin(ny*Math.PI);
      const dy=-cy*strength+height*.003*Math.sin(nx*Math.PI);
      const i=(row*canvas.width+col)*4;
      pixels.data[i]=Math.round(255*(.5+dx/scale));
      pixels.data[i+1]=Math.round(255*(.5+dy/scale));
      pixels.data[i+2]=128;
      pixels.data[i+3]=255;
    }
  }
  context.putImageData(pixels,0,0);
  return {href:canvas.toDataURL(),x,y,width:regionWidth,height:regionHeight,scale};
}
