"use client";
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight, Package, Route, Sparkles, Check } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsap';
import { actionFor, type SectionData } from '@/lib/design';
import { Artwork } from './artwork';
import { ButtonLink } from './button';
import { SectionHeading } from './section-heading';

function DemoScreen({kind}:{kind:number}) {
  return <div className={`case-demo-screen case-demo-${kind}`} aria-label={`Interface demonstrativa de ${kind===1?'Starlog':'Ayalla'}`}>
    <div className="case-demo-top"><strong>{kind===1?'starlog':'ayalla'}</strong><span>Visão geral</span><span className="case-demo-avatar">B</span></div>
    <div className="case-demo-content"><p className="case-demo-overline">{kind===1?'OPERAÇÃO EM MOVIMENTO':'ESPAÇO PARA EVOLUIR'}</p><h4>{kind===1?'Cada entrega.\nUma visão completa.':'Tudo conectado.\nDe um jeito simples.'}</h4>
      <div className="case-demo-dashboard"><div className="case-demo-dashboard-title">{kind===1?<Route size={20}/>:<Sparkles size={20}/>}<span>{kind===1?'Acompanhe o percurso':'Sua próxima etapa'}</span><ArrowUpRight size={18}/></div>
      {['Planejamento','Em andamento','Concluído'].map((text,index)=><div className="case-demo-row" key={text}><span className="case-demo-step">{index===2?<Check size={14}/>:index+1}</span><span>{text}</span><i style={{width:`${75-index*17}%`}} /></div>)}
      </div><span className="case-demo-caption">Interface ilustrativa · demonstração</span>
    </div>
  </div>;
}

export function CasesSection({section}:{section:SectionData}) {
  const scope=useRef<HTMLElement>(null);
  const panel=useRef<HTMLDivElement>(null);
  const tabRefs=useRef<(HTMLButtonElement|null)[]>([]);
  const direction=useRef(1);
  const entryTimeline=useRef<gsap.core.Timeline | null>(null);
  const previousActive=useRef(0);
  const [active,setActive]=useState(0);
  const copy=section.blocks.map(block=>block.runs.map(run=>run.text).join(' '));
  const [label,heading,intro,pasteur,starlog,ayalla,category,title,description,result,resultCaption,quote,author,cta,desktop,ux]=copy;
  const names=[pasteur,starlog,ayalla];
  const projects=[
    {category,title,description,result,resultCaption,quote,author,tags:[desktop,ux]},
    {category:'LOGÍSTICA · VISÃO DEMONSTRATIVA',title:starlog,description:'Uma visão integrada para acompanhar operações, organizar entregas e aproximar equipes. Um exemplo de como apresentar o projeto dentro da nova janela de cases.',result:'Conexão',resultCaption:'Da operação à informação, em um só lugar.',quote:'Uma experiência desenhada para tornar operações complexas mais claras.',author:'Conceito ilustrativo · não é um depoimento',tags:['Plataforma web','Operações']},
    {category:'EXPERIÊNCIA DIGITAL · VISÃO DEMONSTRATIVA',title:ayalla,description:'Uma experiência digital que simplifica jornadas e reúne informações importantes em uma interface intuitiva. Conteúdo de exemplo para explorar o ritmo e a transição entre projetos.',result:'Simplicidade',resultCaption:'Uma jornada fluida do início ao próximo passo.',quote:'Menos atrito na navegação. Mais espaço para o que importa.',author:'Conceito ilustrativo · não é um depoimento',tags:['Produto digital','UX/UI']},
  ];
  const project=projects[active];
  const quoteText=project.quote.replace(/^[“"]|[”"]$/g,'');
  const [headingStart,headingAccent]=heading.split('{');
  const select=(index:number,focus=false)=>{
    if(index<0||index>=projects.length||index===active)return;
    entryTimeline.current?.progress(1);
    direction.current=index>active?1:-1;
    setActive(index);
    if(focus)tabRefs.current[index]?.focus();
  };
  useGSAP(()=>{
    const media=gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)',()=>{
      const browser=scope.current!.querySelector('.case-browser');
      const characters=gsap.utils.toArray<HTMLElement>('.case-quote-character', panel.current!);
      gsap.set(characters,{opacity:0});
      entryTimeline.current=gsap.timeline({
        defaults:{ease:'power3.out'},
        scrollTrigger:{trigger:browser,start:'top 85%',toggleActions:'play none none none'},
      })
        .from('.case-browser',{y:24,scale:.97,opacity:0,duration:.7},0)
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
      timeline.fromTo('.case-visual',{x:direction.current*16,opacity:0},{x:0,opacity:1,duration:.75},0)
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
        <div className="case-navigation"><button type="button" aria-label="Projeto anterior" disabled={active===0} onClick={()=>select(active-1)}><ChevronLeft size={18} strokeWidth={1.7}/></button><button type="button" aria-label="Próximo projeto" disabled={active===2} onClick={()=>select(active+1)}><ChevronRight size={18} strokeWidth={1.7}/></button></div>
        <div className="case-tabs" role="tablist" aria-label="Cases">
          {names.map((name,index)=><button ref={node=>{tabRefs.current[index]=node;}} key={name} className="case-tab" id={`case-tab-${index}`} type="button" role="tab" aria-selected={active===index} aria-controls="case-panel" tabIndex={active===index?0:-1} onClick={()=>select(index)} onKeyDown={event=>{const next=event.key==='ArrowRight'?(active+1)%3:event.key==='ArrowLeft'?(active+2)%3:event.key==='Home'?0:event.key==='End'?2:null;if(next!==null){event.preventDefault();select(next,true);}}}>{index===0?<Artwork src="assets/figma/client-pasteur.svg" className="case-tab-logo" width={24} height={24}/>:index===1?<Package size={17}/>:<Sparkles size={17}/>} {name}</button>)}
        </div>
      </div>
      <div ref={panel} id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${active}`}>
        <div className="case-browser-main">
          <div className="case-story"><p className="case-category">{project.category}</p><h3>{project.title}</h3><p className="case-description">{project.description}</p>
            <div className="case-result"><strong>{project.result}</strong><span>{project.resultCaption}</span></div>
            <ButtonLink className="case-explore" href={actionFor(cta,section.id)}>{cta}<img src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" /></ButtonLink>
          </div>
          <div className="case-visual">{active===0?<Artwork src="assets/figma/case-editorial-screen.svg" className="case-project-image" width={689} height={510}/>:<DemoScreen kind={active}/>}</div>
        </div>
        <footer className="case-testimonial"><span className="case-quote-mark" aria-hidden="true">“</span><blockquote aria-label={quoteText}>{Array.from(quoteText).map((character,index)=><span className="case-quote-character" aria-hidden="true" key={index}>{character}</span>)}</blockquote><div className="case-quote-author">{active===0?<><Artwork src="assets/figma/testimonial-photo.svg" className="case-author-photo" width={64} height={64} alt=""/><p><strong>{project.author.split(',')[0]}</strong><span>{project.author.split(',').slice(1).join(',').trim()}</span></p></>:<p>{project.author}</p>}</div></footer>
      </div>
    </div>
  </section>;
}
