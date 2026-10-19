"use client";
import { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';

/** Trusted local SVGs, with separately animated phone outlines and screens. */
export function AppArtwork({svg,className}:{svg:string;className:string}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const host=root.current!;
    const card=host.querySelector<SVGGElement>('[id$="-qrcode-cta"]');
    const background=card?.querySelector('rect');
    if(!card || !background)return;
    const fill=background.cloneNode() as SVGRectElement;
    fill.removeAttribute('id');
    fill.classList.add('qr-hover-fill');
    const ns='http://www.w3.org/2000/svg';
    const clip=document.createElementNS(ns,'clipPath');
    clip.id=`${card.id}-hover-reveal`;
    clip.setAttribute('clipPathUnits','userSpaceOnUse');
    const circle=document.createElementNS(ns,'circle');
    circle.classList.add('qr-hover-reveal');
    circle.setAttribute('r','0');
    clip.appendChild(circle);
    card.prepend(clip);
    fill.setAttribute('clip-path',`url(#${clip.id})`);
    background.after(fill);
    card.classList.add('qr-hover-card');
    let active=false;
    const reset=()=>{active=false;card.removeAttribute('data-hover');circle.style.r='0px';};
    // The artwork is decorative and ignores pointer events; measure its card
    // from the document so hovering the separate HTML caption also works.
    const move=(event:PointerEvent)=>{
      const box=background.getBoundingClientRect();
      const inside=event.pointerType==='mouse' && box.width>0 &&
        event.clientX>=box.left && event.clientX<=box.right &&
        event.clientY>=box.top && event.clientY<=box.bottom;
      if(inside===active)return;
      if(!inside){reset();return;}
      const matrix=background.getScreenCTM();
      if(!matrix)return;
      const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse());
      const bounds=background.getBBox();
      const radius=Math.hypot(Math.max(point.x-bounds.x,bounds.x+bounds.width-point.x),Math.max(point.y-bounds.y,bounds.y+bounds.height-point.y))+2;
      circle.setAttribute('cx',String(point.x));
      circle.setAttribute('cy',String(point.y));
      circle.style.r=`${radius}px`;
      active=true;card.setAttribute('data-hover','true');
    };
    document.addEventListener('pointermove',move);
    document.addEventListener('pointerleave',reset);
    window.addEventListener('scroll',reset,{passive:true});
    return ()=>{
      document.removeEventListener('pointermove',move);
      document.removeEventListener('pointerleave',reset);
      window.removeEventListener('scroll',reset);
      fill.remove();clip.remove();card.classList.remove('qr-hover-card');reset();
    };
  },[]);
  useGSAP(()=>{
    const host=root.current!;
    const media=gsap.matchMedia();
    const desktop=className.includes('figma-art');
    media.add(`(prefers-reduced-motion: no-preference) and (${desktop?'min-width:1440px':'max-width:1439px'})`,()=>{
      const cleanup:Array<()=>void>=[];
      // Both theme artworks share this background outline and the same trigger.
      host.querySelectorAll<SVGPathElement>('[id$="-Vector_42"]').forEach(logo=>{
        const length=logo.getTotalLength();
        gsap.fromTo(logo,
          {attr:{'stroke-dasharray':`${length} ${length}`,'stroke-dashoffset':length}},
          {attr:{'stroke-dashoffset':0},duration:2.2,ease:'power1.inOut',
            scrollTrigger:{trigger:host.closest('section')?.querySelector('h2'),
              start:'top 85%',toggleActions:'play none none none'}});
      });
      host.querySelectorAll<SVGPathElement>('[id$="-qrcode-cta"] [id$="-beyond"] path').forEach(logo=>{
        const length=logo.getTotalLength();
        gsap.set(logo,{attr:{'stroke-dasharray':`${length} ${length}`,'stroke-dashoffset':length}});
        gsap.fromTo(logo,{attr:{'stroke-dashoffset':length}},
          {attr:{'stroke-dashoffset':0},duration:1.4,ease:'power1.inOut',
            scrollTrigger:{trigger:host.closest('section')?.querySelector('.qr-instructions'),
              start:'top 85%',toggleActions:'play none none none'}});
      });
      host.querySelectorAll<SVGGElement>('[id$="Container_26"],[id$="Container_34"]').forEach((phone,index)=>{
        const frame=phone.querySelector<SVGRectElement>(':scope > rect')!;
        const screen=phone.querySelector<SVGSVGElement>('[data-screen-source]')!;
        const camera=phone.querySelector<SVGGElement>('[id$="Container_33"],[id$="Container_41"]')!;
        const shadow=phone.previousElementSibling!;
        const ns='http://www.w3.org/2000/svg';
        const outline=frame.cloneNode() as SVGRectElement;
        outline.setAttribute('fill','none');
        outline.setAttribute('stroke','#9ca3af');
        outline.setAttribute('stroke-width','2');
        outline.setAttribute('pathLength','1');
        outline.setAttribute('stroke-dasharray','1');
        outline.setAttribute('stroke-dashoffset','1');
        phone.appendChild(outline);
        const clip=document.createElementNS(ns,'clipPath');
        clip.id=`${phone.id}-screen-reveal-${index}`;
        clip.setAttribute('clipPathUnits','userSpaceOnUse');
        const reveal=document.createElementNS(ns,'rect');
        reveal.setAttribute('width','390');
        reveal.setAttribute('height','0');
        clip.appendChild(reveal);
        screen.prepend(clip);
        const content=document.createElementNS(ns,'g');
        while(screen.children.length>1)content.appendChild(screen.children[1]);
        content.setAttribute('clip-path',`url(#${clip.id})`);
        screen.appendChild(content);
        gsap.set([frame,camera,shadow],{opacity:0});
        const timeline=gsap.timeline({scrollTrigger:{trigger:phone,start:'top 85%',toggleActions:'play none none none'}})
          .to(outline,{attr:{'stroke-dashoffset':0},duration:1.15,ease:'power1.inOut'})
          .to(frame,{opacity:1,duration:.45},.8)
          .to(reveal,{attr:{height:809},duration:.65,ease:'power2.inOut'},.95)
          .to([camera,shadow],{opacity:1,duration:.5},1.45)
          .to(outline,{opacity:0,duration:.4},1.55);
        const strokes:SVGElement[]=[];
        const screenMatrix=screen.getScreenCTM();
        // Work in screen coordinates, including nested/transformed card artwork.
        // Snapshot before hiding elements so the final opacity stays unchanged.
        const items=Array.from(content.querySelectorAll<SVGGraphicsElement>('rect,path,circle,ellipse,line,polyline,polygon,text,image'))
          .filter(item=>!item.closest('defs,clipPath,mask,pattern,symbol'))
          .map(item=>{
            const box=item.getBBox();
            const matrix=item.getScreenCTM();
            const position=screenMatrix&&matrix
              ? new DOMPoint(box.x,box.y).matrixTransform(screenMatrix.inverse().multiply(matrix))
              : new DOMPoint(box.x,box.y);
            const style=getComputedStyle(item);
            return {item,box,y:position.y,opacity:Number(style.opacity),stroke:style.stroke,fill:style.fill};
          }).filter(({y,box})=>y<809&&y+box.height>0);
        items.forEach(({item,box,y,opacity,stroke,fill})=>{
          const background=box.width>=380&&box.height>=700;
          const start=background ? .95 : 1.25+Math.max(0,y)/809*1.7;
          gsap.set(item,{opacity:0});
          if(background||item.tagName==='image'){
            timeline.to(item,{opacity,duration:.4},start);
            return;
          }
          const trace=item.cloneNode(true) as SVGElement;
          trace.removeAttribute('id');
          trace.setAttribute('aria-hidden','true');
          trace.setAttribute('data-screen-trace','');
          trace.style.opacity=String(opacity);
          trace.style.fill='none';
          trace.style.stroke=stroke!=='none'?stroke:fill!=='none'&&fill!=='rgb(255, 255, 255)'?fill:'#9ca3af';
          trace.style.strokeWidth=item.tagName==='text'?'.65':'1.4';
          trace.style.strokeLinecap='round';
          const length=item instanceof SVGGeometryElement?Math.max(1,item.getTotalLength()):180;
          trace.removeAttribute('pathLength');
          trace.style.strokeDasharray=String(length);
          trace.style.strokeDashoffset=String(length);
          item.after(trace);
          strokes.push(trace);
          timeline.to(trace,{strokeDashoffset:0,duration:.65,ease:'power1.inOut'},start)
            .to(item,{opacity,duration:.35},start+.45)
            .to(trace,{opacity:0,duration:.3},start+.65);
        });
        cleanup.push(()=>{
          strokes.forEach(stroke=>stroke.remove());
          while(content.firstChild)screen.appendChild(content.firstChild);
          content.remove();clip.remove();outline.remove();
        });
      });
      return ()=>cleanup.forEach(fn=>fn());
    });
    return ()=>media.revert();
  },{scope:root});
  return <div ref={root} className={`${className} app-drawn-art`} aria-hidden="true" dangerouslySetInnerHTML={{__html:svg}}/>;
}
