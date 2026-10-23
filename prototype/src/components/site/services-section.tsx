"use client";
import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Hammer, Wrench } from 'lucide-react';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { actionFor, type SectionData } from '@/lib/design';
import { SectionHeading } from './section-heading';
import { ServiceCard } from './service-card';

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
  const [activeGroup,setActiveGroup]=useState(0);
  const destination=useRef<number | null>(null);
  const scope=useRef<HTMLElement>(null);
  const viewport=useRef<HTMLDivElement>(null);
  const rail=useRef<HTMLDivElement>(null);
  const paintJourney=useRef<()=>void>(()=>{});
  const scrollJourney=useRef<ScrollTrigger|null>(null);
  const copy=section.blocks.map(block=>block.runs.map(run=>run.text).join(' '));
  const titles=section.blocks.filter(block=>block.role==='h3').map(block=>block.runs.map(run=>run.text).join(' '));
  function groupPositions() {
    const element=viewport.current,cards=rail.current?.querySelectorAll<HTMLElement>(':scope > article');
    if(!element || !cards?.length)return [0,0,0];
    const first=cards[0].getBoundingClientRect().left;
    const max=Math.max(0,element.scrollWidth-element.clientWidth);
    return [0,2,4].map(index=>Math.min(max,cards[index].getBoundingClientRect().left-first));
  }
  function updatePagination() {
    const element=viewport.current;
    if(!element)return;
    const positions=groupPositions();
    setActiveGroup(positions.reduce((nearest,position,index)=>Math.abs(position-element.scrollLeft)<Math.abs(positions[nearest]-element.scrollLeft)?index:nearest,0));
    setCanGoBack(element.scrollLeft>2);
    setAtEnd(element.scrollLeft>=element.scrollWidth-element.clientWidth-2);
  }
  function navigate(direction: number | 'first' | 'last' | {group:number}) {
    const windowElement=viewport.current;
    const cards=rail.current?.querySelectorAll<HTMLElement>(':scope > article');
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
    const target=typeof direction==='object'?groupPositions()[direction.group]:direction==='first'?0:direction==='last'?max:pages[Math.max(0,Math.min(pages.length-1,page+direction))];
    destination.current=target;
    if(scrollJourney.current){
      const trigger=scrollJourney.current;
      window.scrollTo({top:trigger.start+(target/max)*(trigger.end-trigger.start),behavior:'smooth'});
      return;
    }
    windowElement.scrollTo({left:target,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }
  useGSAP(()=>{
    const track=rail.current!;
    const element=viewport.current!;
    const path=track.querySelector<SVGPathElement>('.services-route path')!;
    const svg=path.ownerSVGElement!;
    const robots=Array.from(track.querySelectorAll<HTMLElement>(':scope > .builder'));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let length=0;
    let outlineLength=0;
    let construction:gsap.core.Timeline|undefined;
    let traveling=false;
    let cardBounds:{left:number;right:number;top:number;bottom:number}[]=[];
    const journey={distance:0};
    let robotStartDistances=[0,0];
    const robotOffset=(point:DOMPoint)=>{
      const card=cardBounds.find(bounds=>point.x>=bounds.left-24&&point.x<=bounds.right+24);
      if(card&&point.y>card.bottom)return 30;
      if(card&&point.y<card.top)return -30;
      return -26;
    };
    const placeRobots=()=>{
      const joining=journey.distance<robotStartDistances[1];
      robots.forEach((robot,index)=>{
        const distance=Math.max(0,Math.min(length,joining?(index===0?journey.distance:robotStartDistances[1]):journey.distance));
        const point=path.getPointAtLength(distance);
        const spacing=joining?39:72;
        const before=path.getPointAtLength(Math.max(0,distance-12));
        const after=path.getPointAtLength(Math.min(length,distance+12));
        const onVerticalSegment=!joining&&Math.abs(after.y-before.y)>Math.abs(after.x-before.x);
        gsap.set(robot,{left:0,top:0,x:point.x+(onVerticalSegment?0:index*spacing),y:point.y+robotOffset(point)+(onVerticalSegment?index*spacing:0),xPercent:-50,yPercent:-50});
      });
    };
    const followJourney=(distance:number)=>gsap.to(journey,{distance,duration:.45,ease:'power2.out',overwrite:'auto',onUpdate:placeRobots});
    const paint=()=>{
      if(!length)return;
      const max=element.scrollWidth-element.clientWidth;
      const progress=max>0?Math.max(0,Math.min(1,element.scrollLeft/max)):0;
      if(progress<=.001){
        path.style.strokeDasharray=String(length);
        path.style.strokeDashoffset=String(reduced.matches?0:length);
        if(traveling){
          traveling=false;
          gsap.killTweensOf(journey);
          robots.forEach(robot=>{
            gsap.killTweensOf(robot);
          });
          journey.distance=robotStartDistances[0];
          placeRobots();
          construction?.restart();
        }
        return;
      }
      if(!traveling){
        traveling=true;
        construction?.pause();
        journey.distance=robotStartDistances[0];
        placeRobots();
      }
      // Once the card outline is drawn, every bit of carousel progress advances
      // directly into the route to the next service.
      const joinProgress=.18;
      const compact=false;
      const head=compact
        ? outlineLength+(length-outlineLength)*progress
        : progress<joinProgress
          ? robotStartDistances[0]+(robotStartDistances[1]-robotStartDistances[0])*(progress/joinProgress)
          : robotStartDistances[1]+(length-robotStartDistances[1])*((progress-joinProgress)/(1-joinProgress));
      path.style.strokeDasharray=String(length);
      const dashOffset=reduced.matches?0:length-Math.max(outlineLength,head);
      // Native horizontal scrolling can move several cards between frames.
      // Tween the drawn segment so the route visibly grows into each contour.
      if(compact&&!reduced.matches)gsap.to(path,{strokeDashoffset:dashOffset,duration:.48,ease:'power2.out',overwrite:'auto'});
      else path.style.strokeDashoffset=String(dashOffset);
      followJourney(head);
    };
    paintJourney.current=paint;
    const measure=()=>{
      const cards=Array.from(track.querySelectorAll<HTMLElement>(':scope > article'));
      cardBounds=cards.map(card=>({left:card.offsetLeft,right:card.offsetLeft+card.offsetWidth,top:card.offsetTop,bottom:card.offsetTop+card.offsetHeight}));
      const agentCard=cards[0];
      if(!agentCard)return;
      const radius=Math.min(28,agentCard.offsetWidth/2,agentCard.offsetHeight/2);
      const left=agentCard.offsetLeft-1,top=agentCard.offsetTop-1;
      const right=agentCard.offsetLeft+agentCard.offsetWidth+1,bottom=agentCard.offsetTop+agentCard.offsetHeight+1;
      const middle=(top+bottom)/2;
      // A single line closes the agent card before continuing through every other card.
      let d=`M ${right} ${middle} V ${bottom-radius} Q ${right} ${bottom} ${right-radius} ${bottom} H ${left+radius} Q ${left} ${bottom} ${left} ${bottom-radius} V ${top+radius} Q ${left} ${top} ${left+radius} ${top} H ${right-radius} Q ${right} ${top} ${right} ${top+radius} V ${middle}`;
      outlineLength=2*((right-left)+(bottom-top))-(8-2*Math.PI)*radius;
      let previous={x:right,y:middle};
      // Small screens retain the agent-card outline only. The longer route is
      // reserved for the spacious desktop canvas.
      if(true){
        const routePoints=[previous];
        cards.slice(1).forEach((card,index)=>{
          const x=card.offsetLeft-12;
          const cardRight=card.offsetLeft+card.offsetWidth+12;
          const y=(index+1)%2===0?card.offsetTop-42:card.offsetTop+card.offsetHeight+42;
          const turn=(previous.x+x)/2;
          routePoints.push({x:turn,y:previous.y},{x:turn,y},{x,y},{x:cardRight,y});
          previous={x:cardRight,y};
        });
        for(let index=1;index<routePoints.length-1;index++){
          const previousPoint=routePoints[index-1],point=routePoints[index],next=routePoints[index+1];
          const before=Math.hypot(point.x-previousPoint.x,point.y-previousPoint.y);
          const after=Math.hypot(next.x-point.x,next.y-point.y);
          const corner=Math.min(22,before/2,after/2);
          if(!before||!after)continue;
          d+=` L ${point.x-(point.x-previousPoint.x)/before*corner} ${point.y-(point.y-previousPoint.y)/before*corner} Q ${point.x} ${point.y} ${point.x+(next.x-point.x)/after*corner} ${point.y+(next.y-point.y)/after*corner}`;
        }
        const finalPoint=routePoints[routePoints.length-1];
        d+=` L ${finalPoint.x} ${finalPoint.y}`;
      }
      svg.setAttribute('width',String(track.scrollWidth));svg.setAttribute('height',String(track.offsetHeight));
      path.setAttribute('d',d);length=path.getTotalLength();
      const nearestDistance=(target:{x:number;y:number})=>{
        let closest=0,closestDistance=Infinity;
        for(let index=0;index<=360;index++){
          const distance=outlineLength*index/360;
          const point=path.getPointAtLength(distance);
          const squared=(point.x-target.x)**2+(point.y-target.y)**2;
          if(squared<closestDistance){closestDistance=squared;closest=distance;}
        }
        return closest;
      };
      robotStartDistances=[
        nearestDistance({x:left+(right-left)*.78,y:top}),
        Math.max(0,outlineLength-64),
      ];
      if(!traveling){journey.distance=robotStartDistances[0];placeRobots();}
      paint();updatePagination();
    };
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(track);observer.observe(element);
    track.querySelectorAll(':scope > article').forEach(card=>observer.observe(card));
    reduced.addEventListener('change',paint);
    const mm=gsap.matchMedia();
    // The scroll-pinned journey needs enough horizontal and vertical room to
    // read the cards. Tablets and smaller screens retain native scrolling.
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      const element=viewport.current!;
      element.classList.add('is-scroll-driven');
      const tween=gsap.to(element,{scrollLeft:()=>element.scrollWidth-element.clientWidth,ease:'none',onUpdate:paint,
        scrollTrigger:{trigger:'.services-stage',start:'top 96px',end:()=>`+=${element.scrollWidth-element.clientWidth}`,
          pin:true,scrub:.6,invalidateOnRefresh:true}});
      scrollJourney.current=tween.scrollTrigger!;
      return ()=>{scrollJourney.current=null;element.classList.remove('is-scroll-driven');};
    });
    // This first segment introduces the agent card on every motion-enabled
    // layout. On touch devices it is driven by the user's horizontal swipe;
    // desktop adds the pinned page-scroll controller above.
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      construction=gsap.timeline({repeat:-1,yoyo:true,repeatDelay:.15,
        scrollTrigger:{trigger:'.service-agents',start:'top bottom',end:'bottom top',toggleActions:'play pause resume pause'}});
      construction.fromTo(path,{strokeDasharray:()=>length,strokeDashoffset:()=>length},{strokeDashoffset:()=>length-outlineLength,duration:3.6,ease:'power2.inOut',autoRound:false});
    });
    mm.add('(prefers-reduced-motion: no-preference)',()=>{
      const cards=Array.from(rail.current?.querySelectorAll<HTMLElement>(':scope > article')??[]);
      const revealObserver=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
          if(entry.intersectionRatio>=0.18)entry.target.classList.add('is-visible');
          else if(!entry.isIntersecting)entry.target.classList.remove('is-visible');
        });
      // Observe the page viewport as well as the carousel's clipping bounds,
      // so cards reveal when scrolling down to services, not while offscreen.
      },{rootMargin:'0px 0px -18% 0px',threshold:[0,0.18]});
      rail.current?.classList.add('services-fade-ready');
      cards.forEach(card=>revealObserver.observe(card));
      const tools=robots.flatMap(robot=>Array.from(robot.querySelectorAll<SVGElement>('.builder-tool')));
      gsap.to(tools,{rotation:-35,transformOrigin:'bottom left',duration:.18,yoyo:true,repeat:-1,ease:'sine.inOut'});
      return ()=>{
        revealObserver.disconnect();
        rail.current?.classList.remove('services-fade-ready');
        cards.forEach(card=>card.classList.remove('is-visible'));
      };
    });
    return ()=>{observer.disconnect();reduced.removeEventListener('change',paint);paintJourney.current=()=>{};mm.revert();};
  },{scope});
  return <section ref={scope} id="servicos" className="services-editorial" aria-label={section.label}>
    <SectionHeading label={copy[0]} title={<>Problemas que a gente <em>{'{resolve}'}</em></>} subtitle={copy[2]}/>
    <div className="services-stage">
      <div ref={viewport} id="services-carousel" className="services-window" tabIndex={0} role="region" aria-roledescription="carrossel" aria-label="Serviços" onScroll={event=>{updatePagination();paintJourney.current();if(destination.current!==null && Math.abs(event.currentTarget.scrollLeft-destination.current)<2)destination.current=null;}} onPointerDown={()=>{destination.current=null;}} onWheel={()=>{destination.current=null;}} onKeyDown={event=>{
        if(event.target!==event.currentTarget)return;
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
        event.preventDefault();
        navigate(event.key==='Home'?'first':event.key==='End'?'last':event.key==='ArrowRight'?1:-1);
      }}>
        <div ref={rail} className="services-rail">
          {[5,0,1,2,3,4].map(index=>index<5?<ServiceCard key={titles[index]} title={titles[index]} description={descriptions[index]} image={images[index]} imageClass={`service-image-${index}`} />:<ServiceCard key={titles[index]} agent title={titles[index]} description={copy[9]} cta={copy[10]} href={actionFor(copy[10],section.id)} />)}
          <svg className="services-route" aria-hidden="true"><path/></svg>
          <div className="builder builder-one" aria-hidden="true"><Bot size={49} strokeWidth={1.5}/><Hammer className="builder-tool" size={27}/></div>
          <div className="builder builder-two" aria-hidden="true"><Bot size={43} strokeWidth={1.5}/><Wrench className="builder-tool" size={24}/></div>
        </div>
      </div>
      <div className="services-navigation">
        <div className="services-controls">
          <button type="button" className="button testimonial-arrow services-arrow" aria-label="Serviço anterior" disabled={!canGoBack} aria-hidden={!canGoBack} aria-controls="services-carousel" onClick={()=>navigate(-1)}><ArrowLeft className="button-icon" size={24}/></button>
          <button type="button" className="button testimonial-arrow services-arrow" aria-label="Próximo serviço" disabled={atEnd} aria-hidden={atEnd} aria-controls="services-carousel" onClick={()=>navigate(1)}><ArrowRight className="button-icon" size={24}/></button>
        </div>
        <div className="services-pagination" role="group" aria-label="Páginas de serviços">
          {[0,1,2].map(group=><button key={group} type="button" aria-label={`Ir para o grupo ${group+1} de 3 de serviços`} aria-current={activeGroup===group?'true':undefined} aria-controls="services-carousel" onClick={()=>navigate({group})}><span/></button>)}
        </div>
      </div>
    </div>
  </section>;
}

