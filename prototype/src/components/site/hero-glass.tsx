"use client";
import { useEffect, useRef } from 'react';
import { createHeroGlassMap } from '@/lib/hero-glass-map';

/** A masked copy of the hero refracts the actual text and photography underneath. */
export function HeroGlass() {
  const lens = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const glassFilter = useRef<SVGFilterElement>(null);
  const glassMap = useRef<SVGFEImageElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  useEffect(() => {
    const glass = lens.current!;
    const surface = scene.current!;
    const hero = glass.parentElement!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, disposed = false, hasInteracted = false;
    let releaseVideo = () => {};
    let x = 0, y = 0, targetX = 0, targetY = 0;
    let mapX = 0, mapY = 0;
    let angle = 0, angularVelocity = 0, lastTime = 0;
    let mouseSpeed = 0, lastPointerTime = 0;
    let previousPointer: {x:number;y:number;time:number} | null = null;
    const paint = () => {
      const cx=glass.offsetWidth/2,cy=glass.offsetHeight/2;
      glass.style.transformOrigin='0 0';
      glass.style.transform = `translate3d(${x+cx}px,${y+cy}px,0) rotate(${angle}deg) translate(${-cx}px,${-cy}px)`;
      const content=surface.firstElementChild as HTMLElement | null;
      if(content){
        content.style.transformOrigin=`${x+cx}px ${y+cy}px`;
        content.style.transform='scale(1.26)';
      }
      // Cancel the lens rotation for the sampled scene: only the glass turns.
      surface.style.transform = `translate(${cx}px,${cy}px) rotate(${-angle}deg) translate3d(${-x-cx}px,${-y-cy}px,0)`;
      glassMap.current?.setAttribute('x',String(x+mapX));
      glassMap.current?.setAttribute('y',String(y+mapY));
    };
    const tick = (time:number) => {
      const dt=lastTime?Math.min((time-lastTime)/16.667,2):1;
      lastTime=time;
      const dx=targetX-x,dy=targetY-y;
      // Unwrapped angles allow complete turns; smooth angular speed avoids
      // reversing or snapping back when the pointer stops.
      const idle=Math.max(0,time-lastPointerTime-40);
      const desiredSpeed=motion.matches?0:Math.min(6,mouseSpeed*2.5)*Math.exp(-idle/110);
      angularVelocity+=(desiredSpeed-angularVelocity)*(1-Math.pow(.75,dt));
      angle+=angularVelocity*dt;
      const follow=1-Math.pow(1-.38,dt);
      x += dx * follow;
      y += dy * follow;
      paint();
      if (Math.abs(targetX-x)+Math.abs(targetY-y)>.15 || desiredSpeed>.003 || angularVelocity>.003) frame=requestAnimationFrame(tick);
      else {frame=0;lastTime=0;angularVelocity=0;mouseSpeed=0;paint();}
    };
    const wake = () => { if (!frame) frame=requestAnimationFrame(tick); };
    const home = () => {
      targetX=(hero.clientWidth-glass.offsetWidth)/2;
      targetY=(hero.clientHeight-glass.offsetHeight)/2;
    };
    const rebuild = () => {
      if(disposed)return;
      releaseVideo();
      const copy=hero.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('.hero-glass,.hero-glass-filters,.hero-ink').forEach(node=>node.remove());
      copy.removeAttribute('data-ink');
      copy.removeAttribute('id');
      copy.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
      copy.setAttribute('aria-hidden','true');
      copy.inert=true;
      const video=hero.querySelector<HTMLVideoElement>('.hero-video-word video');
      const duplicate=copy.querySelector('video');
      if(video && duplicate){
        // Sample the original decoder so the glass always shows the same frame.
        const canvas=document.createElement('canvas');
        const ctx=canvas.getContext('2d');
        duplicate.replaceWith(canvas);
        let callback=0;
        const draw=()=>{
          if(video.readyState>=2 && ctx){
            if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){canvas.width=video.videoWidth;canvas.height=video.videoHeight;}
            ctx.drawImage(video,0,0);
          }
          callback=video.requestVideoFrameCallback(draw);
        };
        draw();
        releaseVideo=()=>video.cancelVideoFrameCallback(callback);
      }
      Object.assign(copy.style,{position:'relative',margin:'0',width:`${hero.clientWidth}px`,height:`${hero.clientHeight}px`,overflow:'visible'});
      surface.replaceChildren(copy);
      surface.style.width=`${hero.clientWidth}px`;
      surface.style.height=`${hero.clientHeight}px`;
      const map=createHeroGlassMap(glass.offsetWidth,glass.offsetHeight);
      if(map && glassMap.current && glassFilter.current){
        mapX=map.x;mapY=map.y;
        glassMap.current.setAttribute('href',map.href);
        glassMap.current.setAttribute('width',String(map.width));
        glassMap.current.setAttribute('height',String(map.height));
        glassFilter.current.setAttribute('width',String(hero.clientWidth));
        glassFilter.current.setAttribute('height',String(hero.clientHeight));
        displacement.current?.setAttribute('scale',String(map.scale));
      }
      if(!hasInteracted){home();x=targetX;y=targetY;}
      paint();
    };
    const move = (event:PointerEvent) => {
      if(motion.matches||!pointer.matches||event.pointerType==='touch')return;
      hasInteracted=true;
      const now=performance.now();
      if(previousPointer){
        const elapsed=Math.max(1,now-previousPointer.time);
        const distance=Math.hypot(event.clientX-previousPointer.x,event.clientY-previousPointer.y);
        // Pixels per millisecond, independent of pointer event frequency.
        const speed=elapsed>150?0:Math.min(4,distance/elapsed);
        mouseSpeed+=(speed-mouseSpeed)*(1-Math.exp(-elapsed/45));
      }
      previousPointer={x:event.clientX,y:event.clientY,time:now};
      lastPointerTime=now;
      const rect=hero.getBoundingClientRect();
      const cx=event.clientX-rect.left;
      const cy=event.clientY-rect.top;
      targetX=cx-glass.offsetWidth/2;
      targetY=cy-glass.offsetHeight/2;
      wake();
    };
    const leave = () => {
      previousPointer=null;mouseSpeed=0;
      if(motion.matches){cancelAnimationFrame(frame);frame=0;lastTime=0;angularVelocity=0;x=targetX;y=targetY;paint();}
      else wake();
    };
    const resize = new ResizeObserver(rebuild);
    resize.observe(hero);
    void document.fonts.ready.then(rebuild);
    hero.addEventListener('pointermove',move);
    hero.addEventListener('pointerleave',leave);
    motion.addEventListener('change',leave);
    return () => {disposed=true;releaseVideo();cancelAnimationFrame(frame);resize.disconnect();hero.removeEventListener('pointermove',move);hero.removeEventListener('pointerleave',leave);motion.removeEventListener('change',leave);};
  },[]);
  return <>
    <svg className="hero-glass-filters" width="0" height="0" aria-hidden="true"><defs>
      <filter ref={glassFilter} id="hero-refraction" x="0" y="0" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feImage ref={glassMap} result="cylinder" preserveAspectRatio="none" />
        <feGaussianBlur in="cylinder" stdDeviation="3.2" result="smooth-cylinder" />
        <feDisplacementMap ref={displacement} in="SourceGraphic" in2="smooth-cylinder" scale="0" xChannelSelector="R" yChannelSelector="G" result="refracted" />
        <feGaussianBlur in="refracted" stdDeviation="0.2" />
      </filter>
    </defs></svg>
    <div ref={lens} className="hero-glass" aria-hidden="true"><div className="hero-glass-material"><div ref={scene} className="hero-glass-scene" /><div className="hero-glass-tint" /><div className="hero-glass-sheen" /><div className="hero-glass-grain" /></div></div>
  </>;
}

