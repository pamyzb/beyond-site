'use client';
import { Fragment, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import type { SectionData, Style } from '@/lib/design';
import { TextBlock } from './text-block';
import { ProcessCard } from './process-card';
import { SectionHeading } from './section-heading';

function headingRuns(runs: SectionData['blocks'][number]['runs']) {
  let previousY: number | undefined;
  return <>{runs.map((run,index)=>{
    const nextLine=previousY!==undefined && Math.abs(run.y-previousY)>1;
    previousY=run.y;
    return <Fragment key={`${run.text}-${run.x}-${run.y}-${index}`}>{nextLine && <br/>}{run.italic?<em>{run.text}</em>:<span>{run.text}</span>}</Fragment>;
  })}</>;
}

const cards = [
  {id:'Article_12',x:164,y:310,width:530,height:395},
  {id:'Article_13',x:758,y:440,width:530,height:380},
  {id:'Article_15',x:135,y:720,width:530,height:355},
  {id:'Article_14',x:798,y:835,width:530,height:355},
];
export function ProcessSection({section,artwork}:{section:SectionData;artwork:{track:string;marker:string;cards:Record<string,string>;mobileCards:Record<string,string>}}) {
  const scope=useRef<HTMLElement>(null);
  const headingBlocks=section.blocks.filter(block=>block.ancestors.some(ancestor=>ancestor.startsWith('section-title')));
  const headingLabel=headingBlocks.find(block=>block.role==='label');
  const headingTitle=headingBlocks.find(block=>block.role==='h2');
  const headingSubtitle=headingBlocks.find(block=>block.role==='p');
  useGSAP(()=>{
    const root=scope.current!;
    const targets=Array.from(root.querySelectorAll<HTMLElement>('.process-card-entry'))
      .sort((first,second)=>Number(first.dataset.step)-Number(second.dataset.step));
    const svg=root.querySelector<SVGSVGElement>('.process-route-layer svg')!;
    const markerSvg=root.querySelector<SVGSVGElement>('.process-marker-layer svg')!;
    const marker=markerSvg.querySelector<SVGGElement>('[id="process-Container_53-Container_53"]')!;
    const route=document.createElementNS('http://www.w3.org/2000/svg','path');
    route.setAttribute('class','process-route');
    route.setAttribute('fill','none');
    route.setAttribute('stroke','#4B5563');
    route.setAttribute('stroke-width','1.5');
    route.setAttribute('stroke-dasharray','5 9');
    svg.appendChild(route);
    const anchor=(box:DOMRect,side:'left'|'right',vertical:number)=>({
      x:side==='left'?box.left:box.right,
      y:box.top+box.height*vertical,
    });
    const measure=()=>{
      const bounds=root.getBoundingClientRect();
      svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
      markerSvg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
      // The layout wrapper includes the exported SVG's transparent margins.
      // Anchor to the painted card face instead, so the connector visibly
      // meets the card even when the artwork is rotated or scaled.
      const boxes=targets.map(target=>{
        const face=target.querySelector<SVGGraphicsElement>('.process-card-surface rect');
        return face?.getBoundingClientRect() ?? target.getBoundingClientRect();
      });
      // These entry and exit points retain the intentional hand-drawn flow
      // of the reference: 1 → 2 descends, 2 → 3 bends back, then 3 → 4 exits.
      const connections=[
        {from:'right',fromY:.35,to:'left',toY:.52},
        {from:'left',fromY:.54,to:'right',toY:.38},
        {from:'right',fromY:.48,to:'left',toY:.45},
      ] as const;
      const parts=boxes.slice(0,-1).map((box,index)=>{
        const next=boxes[index+1];
        const connection=connections[index];
        const start=anchor(box,connection.from,connection.fromY);
        const end=anchor(next,connection.to,connection.toY);
        const sx=start.x-bounds.left,sy=start.y-bounds.top,ex=end.x-bounds.left,ey=end.y-bounds.top;
        const bend=Math.max(56,Math.min(150,Math.abs(ex-sx)*.42));
        const direction=connection.from==='right'?1:-1;
        // Extend a fraction of a pixel into the painted face to avoid a seam
        // caused by anti-aliasing between the SVG line and rotated card edge.
        const overlap=1.25;
        const startX=sx+direction*overlap,endX=ex-direction*overlap;
        return `M${startX} ${sy} C${sx+bend*direction} ${sy},${ex-bend*direction} ${ey},${endX} ${ey}`;
      });
      route.setAttribute('d',parts.join(' '));
    };
    const place=(progress:number)=>{
      const point=route.getPointAtLength(route.getTotalLength()*progress);
      // The imported marker's centre is at these original Figma coordinates.
      gsap.set(marker,{x:point.x-649.05,y:point.y-7913.4});
    };
    measure();
    place(0);
    const resize=new ResizeObserver(()=>{measure();ScrollTrigger.refresh();});
    resize.observe(root);
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion:no-preference)',()=>{
      const position={progress:0};
      const tween=gsap.to(position,{progress:1,ease:'none',scrollTrigger:{trigger:root,start:'top 25%',end:'bottom 65%',scrub:.65,invalidateOnRefresh:true,onRefresh:()=>{measure();place(position.progress);}},onUpdate:()=>place(position.progress)});
      return ()=>tween.kill();
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
    return ()=>{resize.disconnect();route.remove();media.revert();};
  },{scope});
  return <section ref={scope} id="processo" aria-label={section.label} data-motion="section" className={`design-section relative isolate overflow-hidden section-processo process-animated${section.dark?' theme-dark':''}`} style={{'--section-height':`${section.height}px`} as Style}>
    <div className="process-route-layer" aria-hidden="true"><svg /></div>
    <div className="process-marker-layer" aria-hidden="true" dangerouslySetInnerHTML={{__html:artwork.marker}} />
    <div className="section-content section-content--processo">
      {headingLabel && headingTitle && <SectionHeading className="process-section-heading" label={headingLabel.runs.map(run=>run.text.trim()).join(' ')} title={headingRuns(headingTitle.runs)} subtitle={headingSubtitle?.runs.map(run=>run.text.trim()).join(' ')} />}
      <div className="process-card-column process-card-column--left">
        {[0,2].map(index=>{const card=cards[index];return <ProcessCard key={card.id} card={card} index={index} section={section} artwork={artwork.cards[card.id]} mobileArtwork={artwork.mobileCards[card.id]} />;})}
      </div>
      <div className="process-card-column process-card-column--right">
        {[1,3].map(index=>{const card=cards[index];return <ProcessCard key={card.id} card={card} index={index} section={section} artwork={artwork.cards[card.id]} mobileArtwork={artwork.mobileCards[card.id]} />;})}
      </div>
    </div>
  </section>;
}

