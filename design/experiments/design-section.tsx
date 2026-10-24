"use client";
import { rem, type SectionData, type Style } from '@/lib/figma/design';
import { Artwork, ReflowArtwork } from '@/components/ui/artwork';
import { ContentCards } from '@/components/sections/shared/content-cards';
import { FaqAccordion } from '@/components/sections/faq/faq-accordion';
import { BlogSection } from '@/components/sections/blog/blog-section';
import { ContactForm } from '@/components/sections/contact/contact-form';
import { CasesSection } from '@/components/sections/cases/cases-section';
import { ServicesSection } from '@/components/sections/services/services-section';
import { TestimonialCarousel } from '@/components/sections/testimonials/testimonial-carousel';
import { MetricsSection } from '@/components/sections/metrics/metrics-section';
import { HeroInk } from '@/components/sections/hero/hero-ink';
import { HeroGlass } from '@/components/sections/hero/hero-glass';
import { AppArtwork } from '@/components/sections/app-showcase/app-artwork';
import { ConversationArtwork } from '@/components/sections/conversation/conversation-artwork';

import { FooterRunner } from '@/components/layout/footer/footer-runner';

const figures: Record<string,string> = {conversa:'conversation-photo',contato:'contact-full'};
const fluidArtwork = new Set(['inicio','conversa','contato','aplicativo','metricas','cases','rodape']);
export function DesignSection({ section, conversationOverlay, conversationArtwork, faqArtwork, contactArtwork, appArtwork, footerArtwork }: { section: SectionData; conversationOverlay?: string; conversationArtwork?:string; faqArtwork?:string; contactArtwork?:string; appArtwork?:Record<string,string>; footerArtwork?:string[] }) {
  if(section.id==='blog')return <BlogSection section={section} />;
  if(section.id==='metricas')return <MetricsSection />;
  if(section.id==='cases')return <CasesSection section={section} />;
  if(section.id==='servicos')return <ServicesSection section={section} />;
  const Tag=section.id==='rodape'?'footer':'section';
  const style: Style={'--section-height':rem(section.height)};
  return <Tag id={section.id} aria-label={section.label} data-figma-y={section.y} data-motion="section" style={style}
    className={`design-section relative isolate overflow-hidden section-${section.id}${section.dark?' theme-dark':''}`}>
    {footerArtwork ? <FooterRunner bottomArtwork={footerArtwork}/> : contactArtwork ? <ConversationArtwork svg={contactArtwork} variant="contact"/> : faqArtwork ? <ConversationArtwork svg={faqArtwork} variant="faq"/> : appArtwork ? <AppArtwork svg={appArtwork['aplicativo-bleed']} className="figma-art bleed-art"/> : conversationArtwork ? <ConversationArtwork svg={conversationArtwork}/> : <Artwork src={section.id==='inicio'?'assets/figma/inicio-glass-bleed-no-cta-orphan-arrow.svg':section.id==='depoimentos'?'assets/figma/testimonial-heading.svg':fluidArtwork.has(section.id) ? section.art.replace('.svg','-bleed.svg') : section.art} width={1440} height={section.height} lazy={section.y>1100} className={`figma-art${fluidArtwork.has(section.id)?' bleed-art':''}`} />}
    {/* Trusted, repository-owned SVG only. It contains no page copy or scripts. */}
    {conversationOverlay && <div className="conversation-overlay" aria-hidden="true" dangerouslySetInnerHTML={{__html:conversationOverlay}} />}
    {appArtwork && <AppArtwork svg={appArtwork['aplicativo-light-bleed']} className="figma-art app-light-art bleed-art" />}
    <ContentCards className={`section-content--${section.id}`} appArtwork={appArtwork} section={section.id==='depoimentos'?{...section,blocks:section.blocks.filter(b=>b.ancestors.includes('section-title_5'))}:section}>
      {section.id==='depoimentos' && <TestimonialCarousel section={section}/>}
      {section.id==='faq' && <div className="faq-content-row"><ReflowArtwork name="faq-team" className="faq-team-art" /><FaqAccordion /></div>}
      {section.id==='contato' && <ContactForm />}
    </ContentCards>
    {figures[section.id] && <ReflowArtwork name={figures[section.id]} />}
    {section.id==='inicio' && <>
      <HeroInk /><HeroGlass />
    </>}
  </Tag>;
}
