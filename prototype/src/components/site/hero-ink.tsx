"use client";
import { useEffect, useRef } from 'react';

export function HeroInk() {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const layer=ref.current!,hero=layer.parentElement!;
    const header=document.querySelector<HTMLElement>('.site-header:not(.hero-header-reveal)');
    const nextSection=document.getElementById('metricas');
    const headerOverHero=()=>{
      if(!header)return false;
      const bottom=header.getBoundingClientRect().bottom;
      // The next section covers the pinned hero before its own bounds leave the viewport.
      return hero.getBoundingClientRect().bottom>bottom &&
        (!nextSection || nextSection.getBoundingClientRect().top>bottom);
    };
    document.querySelectorAll('.hero-header-reveal').forEach(node=>node.remove());
    const headerReveal=header?.cloneNode(true) as HTMLElement | undefined;
    let headerSignature='';
    const syncHeader=()=>{
      if(!header || !headerReveal)return;
      const signature=Array.from(header.querySelectorAll('nav a,.language-trigger'),link=>[
        link.textContent,link.getAttribute('href'),link.getAttribute('style'),link.getAttribute('aria-expanded'),
      ].join('|')).join(';');
      if(signature===headerSignature)return;
      headerSignature=signature;
      headerReveal.replaceChildren(...Array.from(header.childNodes,node=>node.cloneNode(true)));
      headerReveal.querySelectorAll('.language-options').forEach(node=>node.remove());
      headerReveal.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
    };
    const headerObserver=new MutationObserver(syncHeader);
    if(headerReveal){
      headerReveal.classList.add('hero-header-reveal');
      headerReveal.setAttribute('aria-hidden','true');
      headerReveal.inert=true;
      headerReveal.querySelectorAll('[id]').forEach(node=>node.removeAttribute('id'));
      document.body.appendChild(headerReveal);
      headerObserver.observe(header!,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['href','aria-label','aria-expanded']});
    }
    const fine=matchMedia('(hover: hover) and (pointer: fine)');
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,disposed=false,lastPaint=0;
    const maskCanvas=document.createElement('canvas');
    const context=maskCanvas.getContext('2d')!;
    const playVideos=()=>layer.querySelectorAll('video').forEach(v=>{v.muted=true;if(v.paused)void v.play().catch(()=>{});});
    const pauseVideos=()=>layer.querySelectorAll('video').forEach(v=>v.pause());
    let points: {x:number;y:number;time:number;phase:number}[]=[];
    const copyHost=layer.querySelector<HTMLElement>('.hero-ink-copy')!;
    const syncControls=(original:Element,copy:Element)=>{
      const selector='.action-link,.button,.menu-toggle';
      const sources=Array.from(original.querySelectorAll<HTMLElement>(selector)).filter(node=>!copyHost.contains(node));
      copy.querySelectorAll<HTMLElement>(selector).forEach((control,index)=>{
        const source=sources[index];
        control.toggleAttribute('data-hover-active',Boolean(source?.matches(':hover, :focus-visible')));
        control.toggleAttribute('data-press-active',Boolean(source?.matches(':active')));
        for(const property of ['--fill-x','--fill-y','--fill-radius']){
          control.style.setProperty(property,source?.style.getPropertyValue(property)||'');
        }
      });
    };
    const rebuild=()=>{
      if(disposed)return;
      const copy=hero.cloneNode(true) as HTMLElement;
      copy.querySelectorAll('.hero-ink,.hero-glass,.hero-glass-filters,.hero-three').forEach(n=>n.remove());
      copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));
      copy.dataset.ink='true';copy.inert=true;
      const arrow=document.createElement('img');
      arrow.src='/assets/figma/hero-description-arrow.svg';arrow.alt='';arrow.className='hero-dark-description-arrow';
      copy.appendChild(arrow);
      const wordVideo=copy.querySelector<HTMLVideoElement>('.hero-video-word video');
      if(wordVideo){wordVideo.src='/assets/hero-section/abstract_green_waves_web.mp4';wordVideo.muted=true;wordVideo.defaultMuted=true;wordVideo.preload='auto';}
      // The viewport can resize while the desktop hero stays 1440px wide.
      // Follow its live bleed offset instead of caching a measured position.
      Object.assign(copy.style,{position:'absolute',left:'max(0px, var(--bleed-offset, 0px))',top:'0',width:`${hero.clientWidth}px`,height:`${hero.clientHeight}px`,margin:'0'});
      copyHost.replaceChildren(copy);
      wordVideo?.load();
      if(points.length)playVideos();
    };
    const paint=(now:number)=>{
      if(now-lastPaint<32){frame=requestAnimationFrame(paint);return;}
      lastPaint=now;
      const lifetime=reduced.matches?250:1800;
      // Avoid enlarging a half-resolution mask, which exposes stair-stepped edges.
      // Cap density to keep the animated mask affordable on high-DPI displays.
      const scale=Math.min(window.devicePixelRatio||1,1.5),w=Math.ceil(layer.clientWidth*scale),h=Math.ceil(layer.clientHeight*scale);
      if(maskCanvas.width!==w||maskCanvas.height!==h){maskCanvas.width=w;maskCanvas.height=h;}
      context.clearRect(0,0,w,h);context.fillStyle='white';
      points=points.filter(p=>now-p.time<lifetime);
      points.forEach(p=>{
        const age=(now-p.time)/lifetime;
        // Original ink expansion and undulating contour, capped locally.
        const progress=reduced.matches?1:1-Math.exp(-(now-p.time)/190);
        const retreat=Math.max(0,(age-.64)/.36);
        const radius=145*progress*(1-retreat*retreat*(3-2*retreat));
        context.beginPath();
        for(let i=0;i<160;i++){
          const a=i/160*Math.PI*2;
          const r=radius*(1+(Math.sin(a*3+progress*3)*.085+Math.cos(a*5-progress*2)*.045)*(1-progress));
          const px=(p.x+Math.cos(a)*r)*scale,py=(p.y+Math.sin(a)*r)*scale;
          if(i===0)context.moveTo(px,py);else context.lineTo(px,py);
        }
        context.closePath();context.fill();
      });
      const mask=`url("${maskCanvas.toDataURL()}")`;
      layer.style.maskImage=mask;
      layer.style.webkitMaskImage=mask;
      layer.style.visibility=points.length?'visible':'hidden';
      syncControls(hero,copyHost);
      if(headerReveal && header){
        syncHeader();
        syncControls(header,headerReveal);
        const layerBounds=layer.getBoundingClientRect();
        const headerBounds=header.getBoundingClientRect();
        headerReveal.style.setProperty('--header-collapse',header.style.getPropertyValue('--header-collapse'));
        headerReveal.style.maskImage=mask;
        headerReveal.style.maskSize=`${layer.clientWidth}px ${layer.clientHeight}px`;
        headerReveal.style.maskPosition=`${layerBounds.left-headerBounds.left}px ${layerBounds.top-headerBounds.top}px`;
        const revealHeader=points.length>0 && headerOverHero() && document.documentElement.dataset.scrollTheme!=='dark';
        header.toggleAttribute('data-dark-area-visible',revealHeader);
        headerReveal.style.visibility=revealHeader?'visible':'hidden';
        // Complementary masks prevent the light and dark text from overlapping.
        if(revealHeader){
          header.style.maskImage=`linear-gradient(white,white),${mask}`;
          header.style.maskComposite='exclude';
          header.style.maskSize=`100% 100%,${layer.clientWidth}px ${layer.clientHeight}px`;
          header.style.maskPosition=`0 0,${layerBounds.left-headerBounds.left}px ${layerBounds.top-headerBounds.top}px`;
          header.style.maskRepeat='no-repeat';
        }else resetHeaderMask();
      }
      if(points.length)frame=requestAnimationFrame(paint);
      else {frame=0;pauseVideos();}
    };
    const move=(e:PointerEvent)=>{
      if(!fine.matches||e.pointerType==='touch')return;
      if(e.currentTarget===header && !headerOverHero())return;
      const rect=layer.getBoundingClientRect(),now=performance.now();
      if(e.clientY<rect.top||e.clientY>rect.bottom)return;
      const x=e.clientX-rect.left,y=e.clientY-rect.top;
      const prev=points.at(-1);
      if(prev&&Math.hypot(x-prev.x,y-prev.y)<12&&now-prev.time<45)return;
      if(prev&&now-prev.time<100){
        const count=Math.min(12,Math.floor(Math.hypot(x-prev.x,y-prev.y)/24));
        for(let i=1;i<count;i++)points.push({x:prev.x+(x-prev.x)*i/count,y:prev.y+(y-prev.y)*i/count,time:now,phase:now/600});
      }
      points.push({x,y,time:now,phase:now/600});points=points.slice(-90);
      playVideos();
      if(!frame)frame=requestAnimationFrame(paint);
    };
    const resetHeaderMask=()=>{
      header?.removeAttribute('data-dark-area-visible');
      for(const property of ['mask-image','mask-composite','mask-size','mask-position','mask-repeat'])header?.style.removeProperty(property);
    };
    const clear=()=>{points=[];cancelAnimationFrame(frame);frame=0;pauseVideos();layer.style.visibility='hidden';if(headerReveal)headerReveal.style.visibility='hidden';resetHeaderMask();};
    const visibility=()=>{if(document.hidden)clear();};
    const resize=new ResizeObserver(rebuild);resize.observe(hero);
    void document.fonts.ready.then(rebuild);
    hero.addEventListener('pointermove',move);
    header?.addEventListener('pointermove',move);
    document.addEventListener('visibilitychange',visibility);
    fine.addEventListener('change',clear);
    return ()=>{disposed=true;clear();headerObserver.disconnect();header?.removeEventListener('pointermove',move);headerReveal?.remove();resize.disconnect();hero.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',visibility);fine.removeEventListener('change',clear);};
  },[]);
  return <div ref={ref} className="hero-ink" aria-hidden="true"><video src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_021419_291eb2af-5ed4-45a0-a1d6-3ef58f4bca0b.mp4" muted loop playsInline preload="metadata" /><div className="hero-ink-shade" /><div className="hero-ink-copy" /></div>;
}
