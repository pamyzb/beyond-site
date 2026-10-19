'use client';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { SectionData, Style } from '@/lib/design';
import { TextBlock } from './text-block';

// Actual card faces (excluding their shadow and artwork wrapper).
const cardFaces = [
  {x:206,y:7803.35,width:430,height:275,angle:-3.2},
  {x:813.375,y:7918.34,width:430,height:249,angle:3},
  {x:177,y:8211.85,width:430,height:233.171,angle:-2.2},
  {x:852.825,y:8313.34,width:430,height:227,angle:3},
];

// Keep the centre of the icon on the edge when a dashed path runs under a card.
function stopAtCardEdge(point:{x:number;y:number},face:typeof cardFaces[number]) {
  const angle=face.angle*Math.PI/180,cos=Math.cos(angle),sin=Math.sin(angle);
  const dx=point.x-face.x,dy=point.y-face.y;
  let x=dx*cos+dy*sin,y=-dx*sin+dy*cos;
  if(x<=0||x>=face.width||y<=0||y>=face.height)return point;
  const distance=Math.min(x,face.width-x,y,face.height-y);
  if(distance===x)x=0;
  else if(distance===face.width-x)x=face.width;
  else if(distance===y)y=0;
  else y=face.height;
  return {x:face.x+x*cos-y*sin,y:face.y+x*sin+y*cos};
}

const cards = [
  {id:'Article_12',x:164,y:310,width:530,height:395},
  {id:'Article_13',x:758,y:440,width:530,height:380},
  {id:'Article_15',x:135,y:720,width:530,height:355},
  {id:'Article_14',x:798,y:835,width:530,height:355},
];
export function ProcessSection({section,artwork}:{section:SectionData;artwork:{track:string;marker:string;cards:Record<string,string>}}) {
  const scope=useRef<HTMLElement>(null);
  useGSAP(()=>{
    const root=scope.current!;
    const media=gsap.matchMedia();
    media.add({wide:'(min-width:1440px)',motion:'(prefers-reduced-motion:no-preference)'},context=>{
      const wide=context.conditions?.wide;
      const targets=Array.from(root.querySelectorAll<HTMLElement>('.process-card-entry'));
      const svg=root.querySelector<SVGSVGElement>('.process-track svg')!;
      const markerSvg=root.querySelector<SVGSVGElement>('.process-marker-layer svg')!;
      const marker=markerSvg.querySelector<SVGGElement>('[id="process-Container_53-Container_53"]')!;
      const route=document.createElementNS('http://www.w3.org/2000/svg','path');
      route.setAttribute('fill','none');
      route.setAttribute('stroke','none');
      svg.appendChild(route);
      let faces=cardFaces;
      const measure=()=>{
        if(wide){
          svg.setAttribute('viewBox','0 7449.59 1440 1148');
          route.setAttribute('d','M613 7905.34 C697.074 7905.34 769.926 8079.34 854 8079.34 L823 8076.34 C664.984 8076.34 748.016 8320.34 590 8320.34 L607 8331.34 C693.865 8331.34 769.135 8444.34 856 8444.34');
        }else{
          const box=root.getBoundingClientRect();
          svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
          faces=targets.map(card=>({x:card.offsetLeft,y:card.offsetTop,width:card.offsetWidth,height:card.offsetHeight,angle:0}));
          const points=targets.map(card=>{
            return {x:card.offsetLeft+card.offsetWidth/2,y:card.offsetTop+card.offsetHeight/2};
          });
          route.setAttribute('d',points.map((p,i)=>i?`L${p.x} ${p.y}`:`M${p.x} ${p.y}`).join(' '));
          route.setAttribute('stroke','#4B5563');
          route.setAttribute('stroke-width','1.5');
          route.setAttribute('stroke-dasharray','5 9');
          svg.insertBefore(route,svg.firstChild);
        }
        markerSvg.setAttribute('viewBox',svg.getAttribute('viewBox')!);
      };
      measure();
      if(!context.conditions?.motion)return ()=>{route.remove();svg.setAttribute('viewBox','0 7449.59 1440 1148');markerSvg.setAttribute('viewBox','0 7449.59 1440 1148');};
      const position={progress:0};
      const place=()=>{
        const pathPoint=route.getPointAtLength(route.getTotalLength()*position.progress);
        const point=faces.reduce((point,face)=>stopAtCardEdge(point,face),{x:pathPoint.x,y:pathPoint.y});
        gsap.set(marker,{x:point.x-649.05,y:point.y-7913.4});
      };
      place();
      gsap.to(position,{progress:1,ease:'none',scrollTrigger:{trigger:root,start:'top 25%',end:'bottom 65%',scrub:.65,invalidateOnRefresh:true,onRefresh:()=>{measure();place();}},onUpdate:place});
      targets.forEach((target,index)=>{
        gsap.fromTo(target,{x:wide?(index%2?440:-440):0,y:wide?120:80,rotation:wide?(index%2?12:-12):-5,scale:.82,opacity:0},
          {x:0,y:0,rotation:0,scale:1,opacity:1,duration:1.65,ease:'power4.out',delay:wide?index*.2:0,
            scrollTrigger:{trigger:wide?root:target,start:wide?'top 82%':'top 92%',toggleActions:'play none none none'}});
      });
      return ()=>{route.remove();svg.setAttribute('viewBox','0 7449.59 1440 1148');markerSvg.setAttribute('viewBox','0 7449.59 1440 1148');};
    });
    media.add('(min-width:1440px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{
      const cleanups=Array.from(root.querySelectorAll<HTMLElement>('.process-card-entry')).map(target=>{
        const face=target.querySelector<SVGGElement>('[id*="-Process Card"]');
        const filterId=face?.getAttribute('filter')?.match(/url\(#(.+)\)/)?.[1];
        const filter=filterId?target.querySelector<SVGFilterElement>(`filter[id="${filterId}"]`):null;
        if(!filter)return ()=>{};
        const offsets=filter.querySelectorAll('feOffset');
        const blur=filter.querySelector('feGaussianBlur');
        // Animate the existing solid grey shadow, rather than adding a dark halo.
        const hover=gsap.timeline({paused:true,defaults:{duration:.45,ease:'power2.out'}})
          .to(offsets[0],{attr:{dx:2,dy:27}},0)
          .to(offsets[1],{attr:{dx:2,dy:38}},0);
        if(blur)hover.to(blur,{attr:{stdDeviation:22}},0);
        const enter=()=>hover.play();
        const leave=()=>hover.reverse();
        target.addEventListener('pointerenter',enter);
        target.addEventListener('pointerleave',leave);
        return ()=>{target.removeEventListener('pointerenter',enter);target.removeEventListener('pointerleave',leave);};
      });
      return ()=>cleanups.forEach(cleanup=>cleanup());
    });
    return ()=>media.revert();
  },{scope});
  return <section ref={scope} id="processo" aria-label={section.label} data-motion="section" className="design-section relative isolate overflow-hidden section-processo process-animated" style={{'--section-height':`${section.height}px`} as Style}>
    <div className="figma-art process-track" aria-hidden="true" dangerouslySetInnerHTML={{__html:artwork.track}} />
    <div className="process-marker-layer" aria-hidden="true" dangerouslySetInnerHTML={{__html:artwork.marker}} />
    <div className="section-content">
      {section.blocks.filter(b=>!b.ancestors.some(a=>cards.some(c=>c.id===a))).map((block,i)=><TextBlock key={i} block={block} section={section}/>)}
      {cards.map((card,index)=><div className="process-card-entry" key={card.id} style={{'--card-x':`${card.x}px`,'--card-y':`${card.y}px`,'--card-width':`${card.width}px`,'--card-height':`${card.height}px`,'--hover-angle':index%2?'2deg':'-2deg'} as Style}>
        <article className="content-card process-card" data-motion="card" data-source={card.id}>
          <div className="process-card-art" aria-hidden="true" dangerouslySetInnerHTML={{__html:artwork.cards[card.id]}}/>
          {section.blocks.filter(b=>b.ancestors.includes(card.id)).map((block,i)=><TextBlock key={i} block={block} section={section}/>)}
        </article>
      </div>)}
    </div>
  </section>;
}

