"use client";
import { useEffect, useRef, useState } from 'react';
import type { SectionData } from '@/lib/design';
import { actionFor } from '@/lib/design';
import { Artwork } from './artwork';
import { TextBlock } from './text-block';

export function SiteHeader({ section }: {section: SectionData}) {
  const [open,setOpen]=useState(false);
  const toggle=useRef<HTMLButtonElement>(null);
  const header=useRef<HTMLElement>(null);
  useEffect(()=>{
    let frame=0;
    const sync=()=>{
      frame=0;
      const progress=Math.min(1,Math.max(0,window.scrollY/180));
      header.current?.style.setProperty('--header-collapse',String(progress));
    };
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(sync);};
    sync();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('pageshow',sync);
    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll',onScroll);
      window.removeEventListener('pageshow',sync);
    };
  },[]);
  return <header ref={header} className={`site-header${open?' menu-open':''}`} onKeyDown={event=>{
    if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}
  }}>
    <div className="header-frame">
      <Artwork src={section.art} width={1440} height={87} className="figma-art header-logo-light" lazy={false} />
      <Artwork src="assets/figma/cabecalho-dark.svg" width={1440} height={87} className="figma-art header-logo-dark" lazy={false} />
      <a className="brand-link" href="#inicio" aria-label="Beyond the Bytes — início" />
      <nav className="desktop-nav" id="mobile-navigation" aria-label="Navegação principal" onClick={event=>{
        if((event.target as Element).closest('a'))setOpen(false);
      }}>{section.blocks.map(block=>block.actionBox ? <a key={block.source} className="button header-cta" href={actionFor(block.runs.map(run=>run.text).join(' '),section.id)}><span className="button-label">{block.runs.map(run=>run.text).join(' ')}</span><img className="button-icon" src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" /></a> : <TextBlock key={block.source} block={block} section={section} />)}</nav>
    </div>
    <a className="mobile-brand" href="#inicio"><Artwork src="assets/figma/brand.svg" width={220} height={23} alt="Beyond the Bytes" className="brand-logo header-logo-light" lazy={false} /><Artwork src="assets/figma/brand-dark.svg" width={220} height={23} className="brand-logo header-logo-dark" lazy={false} /></a>
    <button ref={toggle} className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-navigation" onClick={()=>setOpen(!open)}><span className="button-label">Menu</span></button>
  </header>;
}
