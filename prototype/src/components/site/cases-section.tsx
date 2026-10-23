"use client";
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import type { SectionData } from '@/lib/design';
import { CasePanel, CaseTabIcon, type CaseProject } from './case-panel';
import { SectionHeading } from './section-heading';

export function CasesSection({section}:{section:SectionData}) {
  const scope=useRef<HTMLElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const tabRefs=useRef<(HTMLButtonElement|null)[]>([]);
  const direction=useRef(1);
  const entryTimeline=useRef<gsap.core.Timeline | null>(null);
  const previousActive=useRef(0);
  const scrollCase=useRef(0);
  const [active,setActive]=useState(0);
  const [revealed,setRevealed]=useState(2);
  const copy=section.blocks.map(block=>block.runs.map(run=>run.text).join(' '));
  const [label,heading,intro,pasteur,starlog,ayalla,category,title,description,result,resultCaption,quote,author,cta,desktop,ux]=copy;
  const names=[pasteur,starlog,ayalla];
  const projects:CaseProject[]=[
    {category,title,description,result,resultCaption,quote,author,tags:[desktop,ux]},
    {category:'LOGÍSTICA · VISÃO DEMONSTRATIVA',title:starlog,description:'Uma visão integrada para acompanhar operações, organizar entregas e aproximar equipes. Um exemplo de como apresentar o projeto dentro da nova janela de cases.',result:'Conexão',resultCaption:'Da operação à informação, em um só lugar.',quote:'Uma experiência desenhada para tornar operações complexas mais claras.',author:'Conceito ilustrativo · não é um depoimento',tags:['Plataforma web','Operações']},
    {category:'EXPERIÊNCIA DIGITAL · VISÃO DEMONSTRATIVA',title:ayalla,description:'Uma experiência digital que simplifica jornadas e reúne informações importantes em uma interface intuitiva. Conteúdo de exemplo para explorar o ritmo e a transição entre projetos.',result:'Simplicidade',resultCaption:'Uma jornada fluida do início ao próximo passo.',quote:'Menos atrito na navegação. Mais espaço para o que importa.',author:'Conceito ilustrativo · não é um depoimento',tags:['Produto digital','UX/UI']},
  ];
  const project=projects[active];
  const [headingStart,headingAccent]=heading.split('{');
  const select=(index:number,focus=false)=>{
    if(index<0||index>=projects.length||index===active)return;
    entryTimeline.current?.progress(1);
    direction.current=index>active?1:-1;
    setRevealed(current=>Math.max(current,index));
    setActive(index);
    if(focus)tabRefs.current[index]?.focus();
  };
  useGSAP(()=>{
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      setRevealed(0);
      ScrollTrigger.create({trigger:scope.current!.querySelector('.case-browser'),start:'top 100px',end:()=>`+=${innerHeight*2.4}`,pin:true,onRefresh:self=>setRevealed(current=>Math.max(current,Math.min(2,Math.floor(self.progress*3)))),
        onUpdate:self=>{
          const next=Math.min(2,Math.floor(self.progress*3));
          setRevealed(current=>Math.max(current,next));
          if(next===scrollCase.current)return;
          direction.current=next>scrollCase.current?1:-1;
          scrollCase.current=next;
          entryTimeline.current?.progress(1);
          setActive(next);
        }});
      return ()=>setRevealed(2);
    });
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const browser=scope.current!.querySelector('.case-browser');
      const characters=gsap.utils.toArray<HTMLElement>('.case-quote-character', panel.current!);
      gsap.set(characters,{opacity:0});
      entryTimeline.current=gsap.timeline({
        defaults:{ease:'power3.out'},
        scrollTrigger:{trigger:browser,start:'top 85%',toggleActions:'play none none none'},
      })
        .from('.case-browser-toolbar',{opacity:0,duration:.7},0)
        .from('.case-visual',{y:10,scale:.985,opacity:0,duration:.95,ease:'sine.out'},.24)
        .from('.case-story > *',{y:8,opacity:0,duration:.8,stagger:.07,ease:'sine.out'},.34)
        .from('.case-testimonial',{y:6,opacity:0,duration:.85,ease:'sine.out'},.55);
      characters.forEach((character,index)=>entryTimeline.current!.set(character,{opacity:1},.85+index*.025));
    },scope);
    return ()=>media.revert();
  },{scope});
  useGSAP(()=>{
    // The scroll timeline owns the first entrance; tabs keep their own transition.
    if(previousActive.current===active)return;
    previousActive.current=active;
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const characters=gsap.utils.toArray<HTMLElement>('.case-quote-character', panel.current!);
      gsap.set(characters,{opacity:0});
      const timeline=gsap.timeline({defaults:{ease:'sine.out'}});
      gsap.fromTo(tabRefs.current[active],{x:-120,y:-20,opacity:0},{x:0,y:0,opacity:1,duration:.65,ease:'power3.out'});
      timeline.fromTo('.case-visual',{x:-direction.current*70,opacity:0},{x:0,opacity:1,duration:.75},0)
        .fromTo('.case-story > *',{y:8,opacity:0},{y:0,opacity:1,duration:.6,stagger:.055},.06)
        .fromTo('.case-testimonial',{opacity:0},{opacity:1,duration:.65},.18);
      characters.forEach((character,index)=>timeline.set(character,{opacity:1},.45+index*.025));
    },panel);
    return ()=>media.revert();
  },{scope:panel,dependencies:[active],revertOnUpdate:true});
  return <section ref={scope} id="cases" className="design-section section-cases cases-editorial" aria-label={section.label}>
    <div className="impact-patterns" aria-hidden="true">
      {['top-left','top-right','bottom-left','bottom-right'].map(corner=>
        <img key={corner} className={`impact-pattern impact-pattern-${corner}`} src={`/assets/figma/metrics-pattern-${corner}.svg`} alt="" />
      )}
    </div>
    <SectionHeading label={label} title={<>{headingStart}<em>{'{'}{headingAccent}</em></>} subtitle={intro} />
    <div className="case-browser">
      <div className="case-browser-toolbar">
        <div className="case-window-dots" aria-hidden="true"><i/><i/><i/></div>
        <nav className="case-navigation" aria-label="Navegação entre projetos"><button type="button" aria-label="Projeto anterior" disabled={active===0} onClick={()=>select(active-1)}><ChevronLeft size={18} strokeWidth={1.7}/></button><button type="button" aria-label="Próximo projeto" disabled={active===2} onClick={()=>select(active+1)}><ChevronRight size={18} strokeWidth={1.7}/></button></nav>
        <div className="case-tabs" role="tablist" aria-label="Cases">
          {names.map((name,index)=><button ref={node=>{tabRefs.current[index]=node;}} key={name} className="case-tab" hidden={index>Math.max(revealed,active)} id={`case-tab-${index}`} type="button" role="tab" aria-selected={active===index} aria-controls="case-panel" tabIndex={active===index?0:-1} onClick={()=>select(index)} onKeyDown={event=>{const next=event.key==='ArrowRight'?(active+1)%3:event.key==='ArrowLeft'?(active+2)%3:event.key==='Home'?0:event.key==='End'?2:null;if(next!==null){event.preventDefault();select(next,true);}}}><CaseTabIcon index={index} /> <span className="case-tab-label">{name}</span></button>)}
        </div>
      </div>
      <div ref={panel} id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${active}`}>
        <CasePanel active={active} project={project} cta={cta} />
      </div>
    </div>
  </section>;
}
