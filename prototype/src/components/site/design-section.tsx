"use client";
import { useState } from 'react';
import type { SectionData, Style } from '@/lib/design';
import { Artwork, ReflowArtwork } from './artwork';
import { ContentCards } from './content-cards';
import { FaqAccordion } from './faq-accordion';
import { Button } from './button';
import { ContactForm } from './contact-form';
import { CasesSection } from './cases-section';
import { ServicesSection } from './services-section';
import { TestimonialCarousel } from './testimonial-carousel';
import { MetricsSection } from './metrics-section';
import { HeroGlass } from './hero-three';
import { HeroInk } from './hero-ink';

const figures: Record<string,string> = {conversa:'conversation-photo',faq:'faq-team',contato:'contact-full'};
const fluidArtwork = new Set(['inicio','conversa','contato','aplicativo','metricas','cases','rodape']);
export function DesignSection({ section, conversationOverlay }: { section: SectionData; conversationOverlay?: string }) {
  const [expanded,setExpanded]=useState(false);
  if(section.id==='metricas')return <MetricsSection />;
  if(section.id==='cases')return <CasesSection section={section} />;
  if(section.id==='servicos')return <ServicesSection section={section} />;
  const Tag=section.id==='rodape'?'footer':'section';
  const style: Style={'--section-height':`${section.height}px`};
  return <Tag id={section.id} aria-label={section.label} data-figma-y={section.y} data-motion="section" style={style}
    className={`design-section relative isolate overflow-hidden section-${section.id}${section.dark?' theme-dark':''}${expanded?' is-expanded':''}`}>
    <Artwork src={section.id==='inicio'?'assets/figma/inicio-glass-bleed.svg':section.id==='depoimentos'?'assets/figma/testimonial-heading.svg':fluidArtwork.has(section.id) ? section.art.replace('.svg','-bleed.svg') : section.art} width={1440} height={section.height} lazy={section.y>1100} className={`figma-art${fluidArtwork.has(section.id)?' bleed-art':''}`} />
    {/* Trusted, repository-owned SVG only. It contains no page copy or scripts. */}
    {conversationOverlay && <div className="conversation-overlay" aria-hidden="true" dangerouslySetInnerHTML={{__html:conversationOverlay}} />}
    {section.id==='aplicativo' && <Artwork src="assets/figma/aplicativo-light-bleed.svg" width={1440} height={section.height} className="figma-art app-light-art bleed-art" />}
    <ContentCards section={section.id==='depoimentos'?{...section,blocks:section.blocks.filter(b=>b.ancestors.includes('section-title_5'))}:section} />
    {section.id==='depoimentos' && <TestimonialCarousel section={section}/>}
    {figures[section.id] && <ReflowArtwork name={figures[section.id]} />}
    {section.id==='faq' && <FaqAccordion />}
    {section.id==='inicio' && <><HeroInk /><HeroGlass /></>}
    {section.id==='contato' && <ContactForm />}
    {section.id==='blog' && <div className="blog-shade"><Button className="button-lime" type="button" aria-expanded={expanded} aria-controls="blog" onClick={()=>setExpanded(!expanded)}>{expanded?'− Mostrar menos':'+ Mostrar mais'}</Button></div>}
  </Tag>;
}
