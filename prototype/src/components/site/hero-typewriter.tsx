"use client";
import { useEffect, useRef } from 'react';

export function HeroTypewriter({text}:{text:string}) {
  const root=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    const hero=root.current?.closest('#inicio');
    if(!hero)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const characters=Array.from(text);
    let timer:ReturnType<typeof setTimeout>,count=0,deleting=false,visible=true;
    const draw=(value:string)=>{
      // Keep the masked dark copy in step with the original hero text.
      hero.querySelectorAll('[data-hero-typewriter-output]').forEach(node=>{node.textContent=value;});
    };
    const tick=()=>{
      if(reduced.matches){draw(text);return;}
      if(document.hidden||!visible){timer=setTimeout(tick,250);return;}
      count+=deleting?-1:1;
      draw(characters.slice(0,count).join(''));
      let delay=deleting?38:80;
      if(count===characters.length){deleting=true;delay=1700;}
      else if(count===0){deleting=false;delay=650;}
      timer=setTimeout(tick,delay);
    };
    const restart=()=>{clearTimeout(timer);count=0;deleting=false;draw(reduced.matches?text:'');if(!reduced.matches)timer=setTimeout(tick,450);};
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});
    observer.observe(hero);
    reduced.addEventListener('change',restart);restart();
    return ()=>{clearTimeout(timer);observer.disconnect();reduced.removeEventListener('change',restart);};
  },[text]);
  return <span ref={root} className="hero-typewriter"><span className="hero-typewriter-reserve">{text}</span><span className="hero-typewriter-visual" aria-hidden="true"><span data-hero-typewriter-output>{text}</span><span className="hero-typewriter-caret"/></span></span>;
}
