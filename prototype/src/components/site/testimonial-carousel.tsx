"use client";
import { useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import type { SectionData } from '@/lib/design';
import { Artwork } from './artwork';
import { createCylinderMap } from '@/lib/testimonial-glass';

export function TestimonialCarousel({ section, videoSrc }: { section: SectionData; videoSrc?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const pagination = useRef<HTMLDivElement>(null);
  const previousPage = useRef<number | null>(null);
  const filterId = `testimonial-glass-${useId().replace(/:/g, '')}`;
  const glass = useRef<SVGFilterElement>(null);
  const glassImage = useRef<SVGFEImageElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const lensOffset = useRef<SVGFEOffsetElement>(null);
  const motion = useRef({ pos: 0, target: 0, speed: 0, velocity: 0, intro: 1 });
  const navigate = useRef<(index: number) => void>(()=>{});
  const drag = useRef<{id:number;x:number;y:number;pos:number;lastX:number;time:number;velocity:number;started:boolean}|null>(null);
  const paused = useRef({hover:false,focus:false,visible:false,playing:false});
  const suppressClick = useRef(false);
  const [active,setActive] = useState(0);
  const [notice,setNotice] = useState(false);
  const [playing,setPlaying] = useState(false);
  const original = section.blocks.filter(b=>b.ancestors.includes('Container_43'));
  const [quote,name,role] = original.map(b=>b.runs.map(r=>r.text).join(' '));
  const labels=['Texto','Vídeo','Texto'];
  paused.current.playing = playing;
  const select = (index:number) => navigate.current(index);
  useGSAP(()=>{
    const halos = Array.from(pagination.current!.querySelectorAll<HTMLElement>('.testimonial-page-highlight'));
    const immediate = previousPage.current===null || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gsap.killTweensOf(halos);
    if(immediate){
      halos.forEach((halo,index)=>gsap.set(halo,{scaleX:index===active?1:0,scaleY:index===active?1:0,y:0,skewX:0,opacity:index===active?1:0}));
    } else {
      const direction = gsap.utils.wrap(-1.5,1.5,active-previousPage.current!);
      gsap.to(halos.filter((_,index)=>index!==active),{scaleX:.12,scaleY:0,y:12,skewX:direction*12,opacity:0,duration:.24,ease:'power3.in',overwrite:true});
      gsap.to(halos[active],{scaleX:1,scaleY:1,y:0,skewX:0,opacity:1,duration:.48,delay:.16,ease:'back.out(1.5)',overwrite:true});
    }
    previousPage.current=active;
  },{scope,dependencies:[active]});
  useGSAP(()=>{
    const root = scope.current!;
    const rail = track.current!;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const state = motion.current;
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('.testimonial-slide'));
    const wrap = gsap.utils.wrap(-1.5, 1.5);
    let mapScale = 0;
    let lastPos = state.pos;
    let lastTime = performance.now();
    let wasPlaying = paused.current.playing;
    let idle = 0;
    let tween: gsap.core.Tween | undefined;
    let intro: gsap.core.Tween | undefined;
    let introduced = false;
    const render = () => {
      cards.forEach((card,index)=>{
        const slot = wrap(index-state.pos);
        const distance = Math.min(1,Math.abs(slot));
        gsap.set(card,{xPercent:slot*96,scale:1-distance*.16,opacity:1-distance*.58,
          filter:`blur(${distance*4}px)`,zIndex:Math.abs(slot)<.5?2:1});
      });
      displacement.current?.setAttribute('scale',String(media.matches || paused.current.playing ? 0 : mapScale*(state.intro+state.speed)));
      // The lens follows the signed movement; magnitude still controls bending.
      // Returning to the previous slide mirrors the leading/trailing refraction.
      lensOffset.current?.setAttribute('dx',String(media.matches || paused.current.playing ? 0 : -state.velocity*72));
    };
    const resize = () => {
      const map = createCylinderMap(rail.clientWidth,rail.clientHeight,window.innerWidth);
      if (!map || !glass.current || !glassImage.current) return;
      for (const key of ['x','y','width','height'] as const) {
        glass.current.setAttribute(key,String(map[key]));
        glassImage.current.setAttribute(key,String(map[key]));
      }
      glassImage.current.setAttribute('href',map.href);
      mapScale = map.scale;
      rail.style.filter = `url("#${filterId}")`;
      render();
    };
    navigate.current = (index) => {
      tween?.kill();
      state.target = Math.round(index);
      idle = 0;
      setActive(((state.target%3)+3)%3);
      setNotice(false);
      setPlaying(false);
      if (media.matches) {state.pos=state.target;state.speed=0;state.velocity=0;render();return;}
      tween = gsap.to(state,{pos:state.target,duration:1.15,ease:'expo.inOut',overwrite:'auto'});
    };
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(.1,Math.max(.001,(now-lastTime)/1000));
      lastTime = now;
      const velocity = Math.max(-.7,Math.min(.7,(state.pos-lastPos)/dt*.22));
      const speed = Math.abs(velocity);
      const previousSpeed = state.speed;
      const previousVelocity = state.velocity;
      const smoothing = 1-Math.exp(-12*dt);
      state.speed += (speed-state.speed)*smoothing;
      // Clear the old direction immediately when a drag or tween reverses.
      if(velocity*state.velocity<0)state.velocity=0;
      state.velocity += (velocity-state.velocity)*smoothing;
      if (state.speed<.001) state.speed=0;
      if (Math.abs(state.velocity)<.001) state.velocity=0;
      if (state.pos!==lastPos || state.speed!==previousSpeed || state.velocity!==previousVelocity || intro?.isActive() || wasPlaying!==paused.current.playing) render();
      lastPos = state.pos;
      wasPlaying = paused.current.playing;
      const p=paused.current;
      if (p.visible && !p.hover && !p.focus && !p.playing && !drag.current && !document.hidden && !media.matches && !tween?.isActive()) {
        idle+=dt;
        if(idle>=2.6) navigate.current(state.target+1);
      } else idle=0;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(rail);
    if(!media.matches)gsap.set(rail,{opacity:0,y:36});
    const visibility = new IntersectionObserver(([entry])=>{
      paused.current.visible=entry.isIntersecting;
      if(entry.isIntersecting&&!introduced) {
        introduced=true;
        if(!media.matches) {
          state.intro=1.8;
          intro=gsap.to(state,{intro:1,duration:1.3,ease:'power2.out'});
          gsap.fromTo(rail,{y:36,opacity:0},{y:0,opacity:1,duration:1.3,ease:'power2.out'});
        }
      }
    },{threshold:.25});
    visibility.observe(root);
    const preferenceChanged=()=>{
      if(media.matches){tween?.kill();intro?.kill();gsap.killTweensOf(rail);state.pos=state.target;state.speed=0;state.velocity=0;state.intro=1;gsap.set(rail,{y:0,opacity:1});}
      render();
    };
    media.addEventListener('change',preferenceChanged);
    window.addEventListener('resize',resize);
    gsap.ticker.add(tick);
    resize();
    return ()=>{tween?.kill();intro?.kill();gsap.killTweensOf(rail);observer.disconnect();visibility.disconnect();gsap.ticker.remove(tick);media.removeEventListener('change',preferenceChanged);window.removeEventListener('resize',resize);rail.style.filter='';};
  },{scope,dependencies:[filterId]});
  return <div ref={scope} className="testimonial-carousel" role="region" aria-roledescription="carrossel" aria-label="Depoimentos de clientes"
    onMouseEnter={()=>{paused.current.hover=true;}} onMouseLeave={()=>{paused.current.hover=false;}}
    onFocusCapture={()=>{paused.current.focus=true;}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))paused.current.focus=false;}}
    onKeyDown={e=>{if((e.target as HTMLElement).closest('video'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();select(motion.current.target+(e.key==='ArrowRight'?1:-1));}}}>
    <svg className="testimonial-glass-defs" aria-hidden="true" width="0" height="0"><defs>
      <filter ref={glass} id={filterId} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage ref={glassImage} result="cylinder" preserveAspectRatio="none"/>
        <feOffset ref={lensOffset} in="cylinder" dx="0" dy="0" result="directed-cylinder"/>
        <feDisplacementMap ref={displacement} in="SourceGraphic" in2="directed-cylinder" scale="0" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs></svg>
    <div className="testimonial-viewport"
      onDragStart={e=>e.preventDefault()}
      onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}
      onPointerDown={e=>{
        if(!e.isPrimary||e.button!==0||(e.target as HTMLElement).closest('button,video,a'))return;
        suppressClick.current=false;
        drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,pos:motion.current.pos,lastX:e.clientX,time:performance.now(),velocity:0,started:false};
      }}
      onPointerMove={e=>{
        const d=drag.current;if(!d||d.id!==e.pointerId)return;
        const dx=e.clientX-d.x;const dy=e.clientY-d.y;
        if(!d.started){
          if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag.current=null;return;}
          if(Math.abs(dx)<8)return;
          d.started=true;gsap.killTweensOf(motion.current,'pos');e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.dataset.dragging='true';
        }
        const now=performance.now();const dt=Math.max(8,now-d.time);
        d.velocity=(e.clientX-d.lastX)/dt;d.lastX=e.clientX;d.time=now;
        motion.current.pos=d.pos-dx/(track.current!.clientWidth*.96);
      }}
      onPointerUp={e=>{
        const d=drag.current;if(!d||d.id!==e.pointerId)return;drag.current=null;delete e.currentTarget.dataset.dragging;
        if(d.started){
          suppressClick.current=true;
          const velocity=performance.now()-d.time>100?0:d.velocity;
          const momentum=Math.max(-.7,Math.min(.7,-velocity*180/(track.current!.clientWidth*.96)));
          select(Math.round(motion.current.pos+momentum));
          if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
        }
      }}
      onPointerCancel={e=>{if(drag.current){drag.current=null;delete e.currentTarget.dataset.dragging;select(Math.round(motion.current.pos));}}}>
      <div ref={track} className="testimonial-track">
        {labels.map((label,index)=><article key={index} className={`testimonial-slide ${index===1?'testimonial-video':'testimonial-text'}`} aria-label={`${index+1} de 3: ${label}${index===2?' (prévia repetida)':''}`} aria-hidden={active!==index} inert={active!==index}>
          {index===1?<>
            <Artwork src="assets/natalia-example.jpg" width={1168} height={613} className="testimonial-video-poster" alt=""/>
            <div className="testimonial-video-copy"><blockquote>{quote}</blockquote><p><strong>{name}</strong><span>{role}</span></p></div>
            <button className="button testimonial-play" type="button" aria-label={videoSrc?'Reproduzir depoimento em vídeo':'Ver disponibilidade do depoimento em vídeo'} onClick={()=>videoSrc?setPlaying(true):setNotice(true)}><Play className="button-icon" size={28} fill="currentColor"/></button>
            {!videoSrc && notice && <span className="testimonial-video-status" role="status">Vídeo ainda não disponibilizado.</span>}
            {playing && videoSrc && <video className="testimonial-player" src={videoSrc} controls autoPlay playsInline aria-label={`Depoimento de ${name}`} onEnded={()=>setPlaying(false)} />}
          </>:<>
            <blockquote>{quote}</blockquote>
            <div className="testimonial-person"><div className="testimonial-portrait"><Artwork src="assets/natalia-example.jpg" width={323} height={379} className="testimonial-portrait-image" alt=""/></div><p><strong>{name}</strong><span>{role}</span></p></div>
          </>}
        </article>)}
      </div>
    </div>
    <button type="button" className="button testimonial-arrow testimonial-prev" aria-label="Depoimento anterior" onClick={()=>select(motion.current.target-1)}><ArrowLeft className="button-icon" size={24}/></button>
    <button type="button" className="button testimonial-arrow testimonial-next" aria-label="Próximo depoimento" onClick={()=>select(motion.current.target+1)}><ArrowRight className="button-icon" size={24}/></button>
    <div ref={pagination} className="testimonial-pagination" aria-label="Escolher depoimento">{labels.map((label,i)=><button key={i} className="button button-lime" type="button" aria-label={`Depoimento ${i+1}: ${label}`} aria-current={active===i?'true':undefined} onClick={()=>select(motion.current.target+gsap.utils.wrap(-1.5,1.5,i-active))}><span className="testimonial-page-highlight" aria-hidden="true"/><span className="testimonial-page-number">{String(i+1).padStart(2,'0')}</span></button>)}</div>
    <span className="testimonial-announcement" aria-live="polite">{active+1} de 3 · {active===1?'Prévia em vídeo':'Depoimento em texto'}</span>
  </div>;
}

