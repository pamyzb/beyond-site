import { WHATSAPP } from '@/data/navigation';
import type { ReactNode } from 'react';
import type { SectionData } from '@/lib/figma/design';
import { siteSections, siteSection } from '@/data/site-content';
import { casesContent } from '@/data/cases';
import { servicesContent } from '@/data/services';
import { readHomeArtwork } from '@/lib/server/artwork';
import { SiteHeader } from '@/components/layout/header/site-header';
import { MetricsSection } from '@/components/sections/metrics/metrics-section';
import { FooterRunner } from '@/components/layout/footer/footer-runner';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { HeroSection } from '@/components/sections/hero/hero-section';
import { ServicesSection } from '@/components/sections/services/services-section';
import { CasesSection } from '@/components/sections/cases/cases-section';
import { ConversationSection } from '@/components/sections/conversation/conversation-section';
import { AppSection } from '@/components/sections/app-showcase/app-section';
import { TestimonialsSection } from '@/components/sections/testimonials/testimonials-section';
import { BlogSection } from '@/components/sections/blog/blog-section';
import { FaqSection } from '@/components/sections/faq/faq-section';
import { ContactSection } from '@/components/sections/contact/contact-section';
import { Artwork } from '@/components/ui/artwork';
import { AboutSection } from '@/components/sections/about/about-section';
import { ProcessSection } from '@/components/sections/process/process-section';
import { MotionRoot } from '@/components/motion/motion-root';

export default async function Home() {
  const art = await readHomeArtwork();
  const renderers: Record<string, (section: SectionData) => ReactNode> = {
    inicio: (section) => <HeroSection section={section} />,
    metricas: () => <MetricsSection />,
    servicos: (section) => <ServicesSection content={servicesContent(section)} />,
    cases: (section) => <CasesSection content={casesContent(section)} />,
    conversa: (section) => (
      <ConversationSection
        section={section}
        artwork={art.conversation}
        overlay={art.conversationOverlay}
      />
    ),
    aplicativo: (section) => <AppSection section={section} artwork={art.app} />,
    depoimentos: (section) => <TestimonialsSection section={section} />,
    processo: (section) => <ProcessSection section={section} artwork={art.process} />,
    sobre: (section) => <AboutSection section={section} icons={art.about} />,
    blog: (section) => <BlogSection section={section} />,
    faq: (section) => <FaqSection section={section} artwork={art.faq} />,
    contato: (section) => <ContactSection section={section} artwork={art.contact} />,
  };
  return (
    <MotionRoot>
      <SiteHeader section={siteSection('cabecalho')} />
      <main className="page-frame w-full mx-auto">
        {siteSections
          .filter((section) => !['cabecalho', 'rodape', 'clientes'].includes(section.id))
          .map((section) => {
            const render = renderers[section.id];
            if (!render) throw new Error(`No renderer for section ${section.id}`);
            return (
              <div
                key={section.id}
                className={`section-band w-full${section.dark ? ' theme-dark' : ''}`}
              >
                {render(section)}
              </div>
            );
          })}
      </main>
      <div className="footer-frame mx-auto">
        <SectionShell section={siteSection('rodape')}>
          <FooterRunner bottomArtwork={art.footer} />
        </SectionShell>
      </div>
      <a
        className="floating-whatsapp button fixed z-30 rounded-full"
        href={WHATSAPP}
        tabIndex={-1}
        aria-hidden="true"
        aria-label="Conversar com a Beyond pelo WhatsApp"
      >
        <Artwork
          src="assets/compartilhados/whatsapp-icon.svg"
          className="figma-art button-icon"
          width={76}
          height={76}
          lazy={false}
        />
      </a>
    </MotionRoot>
  );
}
