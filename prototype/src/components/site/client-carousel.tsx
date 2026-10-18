"use client";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from '@/lib/gsap';

type Client = {key:string;name:string;summary:string;image:string};
const descriptions: Record<string,string> = {
  Article:'A Universidade de São Paulo (USP) é uma universidade pública dedicada ao ensino, à pesquisa e à extensão, com atuação em diversas áreas do conhecimento.',
  Article_2:'O Institut Pasteur atua na pesquisa científica em saúde, com foco em doenças infecciosas, microbiologia e no desenvolvimento do conhecimento para a prevenção de doenças.',
  Article_3:'A Superpet é uma feira do setor pet que reúne empresas, marcas e profissionais para apresentar produtos, compartilhar conhecimento e criar oportunidades de negócios.',
};

export function ClientCarousel({clients}:{clients:Client[]}) {
  const [active,setActive]=useState<{client:Client;trigger:HTMLButtonElement;id:string}|null>(null);
  const [position,setPosition]=useState({left:12,top:0,arrowLeft:170,above:true,ready:false});
  const card=useRef<HTMLDivElement>(null);
  const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const cancelClose=()=>{if(closeTimer.current)clearTimeout(closeTimer.current);};
  const scheduleClose=()=>{cancelClose();closeTimer.current=setTimeout(()=>setActive(null),160);};
  const open=(client:Client,trigger:HTMLButtonElement,id:string)=>{
    cancelClose();
    if(active?.id===id)return;
    setPosition(p=>({...p,ready:false}));setActive({client,trigger,id});
  };
  useLayoutEffect(()=>{
    if(!active||!card.current)return;
    const rect=active.trigger.getBoundingClientRect();
    // Measure layout, independent of the opening transform.
    const {offsetWidth:width,offsetHeight:height}=card.current;
    const above=rect.top-height-12>=96;
    const top=above?rect.top-height-12:rect.bottom+12;
    const left=Math.max(12,Math.min(innerWidth-width-12,rect.left+rect.width/2-width/2));
    setPosition({left,top:Math.max(12,Math.min(innerHeight-height-12,top)),arrowLeft:Math.max(24,Math.min(width-24,rect.left+rect.width/2-left)),above,ready:true});
  },[active]);
  useLayoutEffect(()=>{
    const element=card.current;
    if(!element||!active||!position.ready)return;
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const content=element.querySelector('.client-tooltip-content');
      const details=element.querySelectorAll('.client-tooltip-image img,.client-tooltip-body h3,.client-tooltip-body p');
      const tip=position.arrowLeft/element.offsetWidth*100;
      const narrow=position.above
        ? `polygon(${tip-8}% 0%, ${tip+8}% 0%, ${tip+2}% 100%, ${tip-2}% 100%)`
        : `polygon(${tip-2}% 0%, ${tip+2}% 0%, ${tip+8}% 100%, ${tip-8}% 100%)`;
      const timeline=gsap.timeline({defaults:{ease:'power3.out'}});
      gsap.set(element,{transformOrigin:`${position.arrowLeft}px ${position.above?'calc(100% + 7px)':'-7px'}`,willChange:'transform,opacity'});
      timeline.fromTo(element,{opacity:0,scaleX:.35,scaleY:.04,y:position.above?10:-10},{opacity:1,scaleY:1,scaleX:1,y:0,duration:.62,ease:'power4.out',clearProps:'willChange'},0)
        .fromTo(content,{clipPath:narrow},{clipPath:'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',duration:.5,ease:'power3.inOut',clearProps:'clipPath'},0)
        .fromTo(details,{opacity:0,y:position.above?9:-9},{opacity:1,y:0,duration:.28,stagger:.045,clearProps:'opacity,transform'},.2);
    },element);
    return ()=>media.revert();
    // Repositioning on scroll must not replay the entrance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[active?.id,position.ready]);
  useEffect(()=>{
    if(!active)return;
    const dismiss=(event:KeyboardEvent)=>{if(event.key==='Escape')setActive(null);};
    const outside=(event:PointerEvent)=>{if(event.target instanceof Node&&!card.current?.contains(event.target)&&!active.trigger.contains(event.target))setActive(null);};
    const reposition=()=>{
      const rect=active.trigger.getBoundingClientRect();
      if(rect.bottom<0||rect.top>innerHeight)setActive(null);
      else setActive(current=>current?{...current}:null);
    };
    document.addEventListener('keydown',dismiss);
    document.addEventListener('pointerdown',outside);
    window.addEventListener('scroll',reposition,true);
    window.addEventListener('resize',reposition);
    return ()=>{document.removeEventListener('keydown',dismiss);document.removeEventListener('pointerdown',outside);window.removeEventListener('scroll',reposition,true);window.removeEventListener('resize',reposition);};
  },[active]);
  useEffect(()=>()=>{if(closeTimer.current)clearTimeout(closeTimer.current);},[]);
  return <>
    <div className={`client-strip${active?' is-paused':''}`}><div className="client-track">
      {Array.from({length:4},(_,repeat)=>clients.map(client=>{
        const id=`client-info-${repeat}-${client.key}`;
        return <button type="button" className="client-strip-item" aria-label={`${client.name}: ${client.summary}`} key={id} tabIndex={repeat===0?0:-1} aria-hidden={repeat>0?true:undefined} aria-describedby={active?.id===id?id:undefined}
          onPointerEnter={event=>{if(event.pointerType!=='touch')open(client,event.currentTarget,id);}} onPointerLeave={scheduleClose}
          onFocus={event=>open(client,event.currentTarget,id)} onBlur={scheduleClose}
          onClick={event=>open(client,event.currentTarget,id)}>
          <img className="component-art" src={client.image.replace(/\.svg$/, '-dark.png')} alt="" /><span className="client-copy"><span>{client.name}</span><span>{client.summary}</span></span>
        </button>;
      }))}
    </div></div>
    {active&&createPortal(<div ref={card} id={active.id} role="tooltip" className="client-tooltip" data-side={position.above?'above':'below'} style={{left:position.left,top:position.top,visibility:position.ready?'visible':'hidden'}} onPointerEnter={cancelClose} onPointerLeave={scheduleClose}>
      <span className="client-tooltip-arrow" aria-hidden="true" style={{left:position.arrowLeft}} />
      <div className="client-tooltip-content">
      <div className="client-tooltip-image"><img src={active.client.image} alt="" /></div>
      <div className="client-tooltip-body"><h3>{active.client.name}</h3><p>{descriptions[active.client.key]||active.client.summary}</p></div>
      </div>
    </div>,document.body)}
  </>;
}
