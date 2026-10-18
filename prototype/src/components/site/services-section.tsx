"use client";
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Hammer, Wrench } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import { actionFor, type SectionData } from '@/lib/design';
import { SectionHeading } from './section-heading';
import { ButtonLink } from './button';

const images=['/assets/figma/blog-19.svg','/assets/figma/blog-20.svg','/assets/figma/case-editorial-screen.svg','/assets/service-ai-team.png','/assets/figma/conversation-photo.svg'];
const descriptions=[
  'Da ideia ao lançamento, criamos produtos digitais intuitivos e preparados para crescer com o seu negócio e conquistar seus usuários.',
  'Conectamos processos, dados e equipes em um sistema feito para sua operação, reduzindo tarefas manuais e facilitando a gestão do negócio.',
  'Desenvolvemos aplicativos e plataformas web sob medida, com experiências simples de usar e tecnologia preparada para acompanhar seu crescimento.',
  'Aplicamos inteligência artificial aos desafios do seu negócio para automatizar tarefas, analisar informações e apoiar decisões com mais clareza.',
  'Cuidamos da estabilidade, da segurança e da evolução do seu software, com suporte contínuo e melhorias que acompanham as necessidades da operação.',
];

export function ServicesSection({section}:{section:SectionData}) {
  const [canGoBack,setCanGoBack]=useState(false);
  const [atEnd,setAtEnd]=useState(false);
  const destination=useRef<number | null>(null);
  const scope=useRef<HTMLElement>(null);
  const viewport=useRef<HTMLDivElement>(null);
  const rail=useRef<HTMLDivElement>(null);
  const copy=section.blocks.map(block=>block.runs.map(run=>run.text).join(' '));
  const titles=section.blocks.filter(block=>block.role==='h3').map(block=>block.runs.map(run=>run.text).join(' '));
  function navigate(direction: number | 'first' | 'last') {
    const windowElement=viewport.current;
    const cards=rail.current?.children;
    if(!windowElement || !cards?.length)return;
    const first=cards[0].getBoundingClientRect().left;
    const max=Math.max(0,windowElement.scrollWidth-windowElement.clientWidth);
    const inset=parseFloat(getComputedStyle(windowElement).scrollPaddingLeft)||0;
    const geometry=Array.from(cards,card=>{
      const bounds=card.getBoundingClientRect();
      return {left:bounds.left-first,right:bounds.right-first+inset};
    });
    // Advance past fully visible cards, keeping partially visible ones in the next page.
    const pages=[0];
    while(pages[pages.length-1]<max-2){
      const currentPage=pages[pages.length-1];
      const nextCard=geometry.find(card=>card.left>currentPage+2 && card.right>currentPage+windowElement.clientWidth+2);
      const nextPage=Math.min(max,nextCard?.left??max);
      if(nextPage<=currentPage+2)break;
      pages.push(nextPage);
    }
    const current=destination.current??windowElement.scrollLeft;
    const page=pages.reduce((nearest,position,index)=>Math.abs(position-current)<Math.abs(pages[nearest]-current)?index:nearest,0);
    const target=direction==='first'?0:direction==='last'?max:pages[Math.max(0,Math.min(pages.length-1,page+direction))];
    destination.current=target;
    windowElement.scrollTo({left:target,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  useGSAP(()=>{
    const outline=scope.current?.querySelector<SVGSVGElement>('.agent-assembly');
    const updateOutline=()=>{
      if(!outline)return;
      const width=outline.clientWidth-2;
      const height=outline.clientHeight-2;
      const radius=Math.min(30,width/2,height/2);
      const middle=1+height/2;
      const right=1+width;
      const bottom=1+height;
      const paths=outline.querySelectorAll('path');
      paths[0]?.setAttribute('d',`M 1 ${middle} V ${1+radius} Q 1 1 ${1+radius} 1 H ${right-radius} Q ${right} 1 ${right} ${1+radius} V ${middle}`);
      paths[1]?.setAttribute('d',`M 1 ${middle} V ${bottom-radius} Q 1 ${bottom} ${1+radius} ${bottom} H ${right-radius} Q ${right} ${bottom} ${right} ${bottom-radius} V ${middle}`);
    };
    updateOutline();
    const observer=new ResizeObserver(updateOutline);
    if(outline)observer.observe(outline);
    const mm=gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      const cards=Array.from(rail.current?.children??[]);
      const revealObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.intersectionRatio>=0.08)entry.target.classList.add('is-visible');
          else if(!entry.isIntersecting)entry.target.classList.remove('is-visible');
        });
      },{root:viewport.current,threshold:[0,0.08]});
      rail.current?.classList.add('services-fade-ready');
      cards.forEach(card=>revealObserver.observe(card));
      const work=gsap.timeline({repeat:-1,yoyo:true,repeatDelay:0.1,scrollTrigger:{trigger:scope.current,start:'top bottom',end:'bottom top',toggleActions:'play pause resume pause'}});
      work.fromTo('.agent-assembly path',{strokeDashoffset:1000},{strokeDashoffset:0,duration:3.6,ease:'power2.inOut',autoRound:false})
        .fromTo('.builder-one',{x:0},{x:100,duration:3,ease:'power1.inOut'},0)
        .fromTo('.builder-two',{y:18},{y:-26,duration:1.5,yoyo:true,repeat:1,ease:'sine.inOut'},0)
        .to('.builder-tool',{rotation:-35,transformOrigin:'bottom left',duration:0.18,yoyo:true,repeat:15},0);
      return ()=>{
        revealObserver.disconnect();
        rail.current?.classList.remove('services-fade-ready');
        cards.forEach(card=>card.classList.remove('is-visible'));
      };
    });
    return ()=>{observer.disconnect();mm.revert();};
  },{scope});
  return <section ref={scope} id="servicos" className="services-editorial" aria-label={section.label}>
    <SectionHeading label={copy[0]} title={<>Problemas que a gente <em>{'{resolve}'}</em></>} subtitle={copy[2]}/>
    <div className="services-stage">
      <div ref={viewport} id="services-carousel" className="services-window" tabIndex={0} role="region" aria-roledescription="carrossel" aria-label="Serviços" onScroll={event=>{setCanGoBack(event.currentTarget.scrollLeft>2);setAtEnd(event.currentTarget.scrollLeft>=event.currentTarget.scrollWidth-event.currentTarget.clientWidth-2);if(destination.current!==null && Math.abs(event.currentTarget.scrollLeft-destination.current)<2)destination.current=null;}} onPointerDown={()=>{destination.current=null;}} onWheel={()=>{destination.current=null;}} onKeyDown={event=>{
        if(event.target!==event.currentTarget)return;
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();
        navigate(event.key==='Home'?'first':event.key==='End'?'last':event.key==='ArrowRight'?1:-1);
      }}>
        <div ref={rail} className="services-rail">
          {[5,0,1,2,3,4].map(index=>index<5?<article className="service-editorial-card" key={titles[index]}>
            <div className={`service-image service-image-${index}`}><img src={images[index]} alt="" loading="lazy"/></div>
            <div className="service-caption"><h3>{titles[index]}</h3><p>{descriptions[index]}</p></div>
          </article>:<article className="service-editorial-card service-agents" key={titles[index]}>
            <svg className="agent-assembly" aria-hidden="true"><path pathLength="1000"/><path pathLength="1000"/></svg>
            <div className="builder builder-one" aria-hidden="true"><Bot size={49} strokeWidth={1.5}/><Hammer className="builder-tool" size={27}/></div>
            <div className="builder builder-two" aria-hidden="true"><Bot size={43} strokeWidth={1.5}/><Wrench className="builder-tool" size={24}/></div>
            <div className="agent-construction" aria-hidden="true">
              <img className="agent-art" src="/assets/service-agents-team.png" alt="" loading="lazy"/>
            </div>
            <div className="service-caption"><h3>{titles[index]}</h3><p>{copy[9]}</p><ButtonLink className="service-details" href={actionFor(copy[10],section.id)}>{copy[10]}<img className="button-icon" src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" /></ButtonLink></div>
          </article>)}
        </div>
      </div>
      <div className="services-controls">
        <button type="button" className="button testimonial-arrow services-arrow" aria-label="Serviço anterior" disabled={!canGoBack} aria-hidden={!canGoBack} aria-controls="services-carousel" onClick={()=>navigate(-1)}><ArrowLeft className="button-icon" size={24}/></button>
        <button type="button" className="button testimonial-arrow services-arrow" aria-label="Próximo serviço" disabled={atEnd} aria-hidden={atEnd} aria-controls="services-carousel" onClick={()=>navigate(1)}><ArrowRight className="button-icon" size={24}/></button>
      </div>
    </div>
    <div className="services-contact"><ButtonLink className="services-contact-button" href={actionFor(copy[11],section.id)}><img className="button-icon" src="/assets/figma/whatsapp-button-icon.svg" width={24} height={24} alt="" />{copy[11]}</ButtonLink><p>{copy[12]}</p></div>
  </section>;
}

