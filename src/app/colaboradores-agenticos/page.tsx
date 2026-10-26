import type { Metadata } from 'next';
import { TrendingUp, ClipboardClock, FileWarning, Funnel, Bot, Hammer } from 'lucide-react';
import { CountUp } from '@/components/sections/metrics/count-up';
import { SiteHeader } from '@/components/layout/header/site-header';
import { FooterRunner } from '@/components/layout/footer/footer-runner';
import { MotionRoot } from '@/components/motion/motion-root';
import { HeroTypewriter } from '@/components/sections/hero/hero-typewriter';
import { AgentScene } from '@/components/sections/hero/agent-scene';
import { ContactSection } from '@/components/sections/contact/contact-section';
import { AboutCard } from '@/components/sections/about/about-card';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { ButtonLink } from '@/components/ui/button';
import { Title } from '@/components/ui/title';
import { CircularCarousel } from '@/components/ui/circular-carousel';
import { Artwork } from '@/components/ui/artwork';
import { SectionHeading } from '@/components/ui/section-heading';
import { SecondarySectionHeading } from '@/components/ui/secondary-section-heading';
import { siteSection } from '@/data/site-content';
import { agentService } from '@/data/agent-service';
import { WHATSAPP } from '@/data/navigation';
import { readArtwork, readNamespacedArtwork, stripSvgXml } from '@/lib/server/svg';
import './service.css';
import { readProcessArtwork } from '@/lib/server/process-artwork';

export const metadata: Metadata = {
  title: 'Colaboradores agênticos — Beyond the Bytes',
  description: agentService.description,
};

export default async function AgentServicePage() {
  const challengeIcons = [TrendingUp, ClipboardClock, FileWarning, Funnel];
  const [contact, footer, process] = await Promise.all([
    readNamespacedArtwork('contact', 'contact-art'),
    Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        readArtwork(`footer-${index + 1}` as Parameters<typeof readArtwork>[0]).then(stripSvgXml),
      ),
    ),
    readProcessArtwork(),
  ]);

  return (
    <MotionRoot themeTrigger="#resultados .section-heading" themeReverse whatsappTrigger="#sobre">
      <SiteHeader section={siteSection('cabecalho')} homePath="/" />
      <main className="agent-service-page">
        <section id="inicio" className="agent-hero theme-dark" aria-labelledby="agent-title">
          <div className="agent-hero-inner">
            <div className="agent-hero-copy">
              <p className="hero-eyebrow">
                <HeroTypewriter text={agentService.label} />
              </p>
              <Title as="h1" variant="hero" id="agent-title" className="agent-hero-title">
                {agentService.title}
                <em>{`{${agentService.titleAccent}}`}</em>
              </Title>
              <p className="agent-hero-description">{agentService.description}</p>
              <div className="agent-hero-actions">
                <ButtonLink variant="primary-lime" href="#contato">
                  {agentService.action}
                  <img
                    src="/assets/compartilhados/header-button-arrow.svg"
                    width={18}
                    height={18}
                    alt=""
                  />
                </ButtonLink>
                <ButtonLink variant="secondary" href="#resultados">
                  {agentService.resultsAction}
                </ButtonLink>
              </div>
            </div>
            <AgentScene
              scene={agentService.scene}
              marker={process.marker.replace(
                'viewBox="0 7449.59 1440 1148"',
                'viewBox="624.05 7888.4 50 50"',
              )}
            />
          </div>
        </section>
        <div className="agent-service-content theme-dark">
          <section
            id="sobre"
            className="agent-service-section"
            aria-label={agentService.about.label}
          >
            <SectionHeading
              label={agentService.about.label}
              title={
                <>
                  {agentService.about.title} <em>{`{${agentService.about.accent}}`}</em>
                </>
              }
            />
            <div className="agent-about-layout">
              <Artwork
                src="assets/servicos/agenticos-sobre.svg"
                width={1039}
                height={647}
                alt="Equipe da Beyond trabalhando em computadores no escritório"
                className="agent-about-photo"
              />
              <div className="agent-service-prose">
                {agentService.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p className="agent-service-statement">{agentService.about.closing}</p>
              </div>
            </div>
          </section>
          <section
            id="o-que-resolvem"
            className="agent-service-section agent-challenges"
            aria-label={agentService.challenges.label}
          >
            <SectionHeading
              label={agentService.challenges.label}
              title={
                <>
                  {agentService.challenges.title} <em>{`{${agentService.challenges.accent}}`}</em>
                </>
              }
              subtitle={agentService.challenges.description}
            />
            <div className="agent-challenge-list">
              {agentService.challenges.items.map((item, index) => {
                const Icon = challengeIcons[index];
                return (
                  <AboutCard key={item.title} content={item} icon={<Icon strokeWidth={1.75} />} />
                );
              })}
            </div>
          </section>
          <section
            id="como-atuam"
            className="agent-service-section"
            aria-label={agentService.roles.label}
          >
            <SectionHeading
              label={agentService.roles.label}
              title={
                <>
                  {agentService.roles.title} <em>{`{${agentService.roles.accent}}`}</em>
                </>
              }
              subtitle={agentService.roles.description}
            />
            <div
              className="agent-role-diagram"
              aria-label="Níveis de responsabilidade entre pessoas e IA"
            >
              {agentService.roles.items.map((item) => (
                <article key={item.title} className="agent-role">
                  <svg className="agent-role-outline" aria-hidden="true" focusable="false">
                    <rect pathLength="1000" />
                  </svg>
                  <p className="agent-role-owner">{item.owner}</p>
                  <Title as="h3" variant="service">
                    {item.title}
                  </Title>
                  <p className="agent-role-description">{item.description}</p>
                </article>
              ))}
            </div>
            <SecondarySectionHeading
              className="agent-roles-closing"
              title={agentService.roles.closing.map((line) => (
                <span className="agent-closing-line" key={line}>
                  {line}
                </span>
              ))}
            />
          </section>
          <section
            id="resultados"
            className="agent-service-section"
            aria-label={agentService.results.label}
          >
            <SectionHeading
              label={agentService.results.label}
              title={
                <>
                  {agentService.results.title} <em>{`{${agentService.results.accent}}`}</em>
                </>
              }
              subtitle={agentService.results.description}
            />
            <div className="agent-results-grid">
              {agentService.results.sectors.map((sector) => (
                <article className="agent-result-sector" key={sector.name}>
                  <Title as="h3" variant="service">
                    {sector.name}
                  </Title>
                  <p className="agent-result-context">{sector.context}</p>
                  <dl className="agent-result-metrics">
                    <div className="agent-result-savings">
                      <dt>Economia na folha</dt>
                      <dd aria-label={sector.savings}>
                        <CountUp value={Number(sector.savings.split('%')[0])} suffix="%" />
                        <span aria-hidden="true"> a </span>
                        <CountUp
                          value={Number(sector.savings.split(' a ')[1].replace('%', ''))}
                          suffix="%"
                        />
                      </dd>
                    </div>
                    {sector.metrics.map((metric) => (
                      <div className="agent-result-row" key={metric.label}>
                        <dt>{metric.label}</dt>
                        <dd>{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
            <p className="agent-results-note">{agentService.results.note}</p>
          </section>
          <section
            id="aplicacoes"
            className="agent-service-section"
            aria-label={agentService.applications.label}
          >
            <div className="impact-patterns" aria-hidden="true">
              {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => (
                <img
                  key={corner}
                  className={`impact-pattern impact-pattern-${corner}`}
                  src={`/assets/metricas/metrics-pattern-${corner}.svg`}
                  alt=""
                />
              ))}
            </div>
            <SectionHeading
              label={agentService.applications.label}
              title={
                <>
                  {agentService.applications.title}{' '}
                  <em>{`{${agentService.applications.accent}}`}</em>
                </>
              }
              subtitle={agentService.applications.description}
            />
            <CircularCarousel items={agentService.applications.items} />
          </section>
          <section
            id="contratacao-e-entrega"
            className="agent-service-section"
            aria-label={agentService.delivery.label}
          >
            <SectionHeading
              label={agentService.delivery.label}
              title={
                <>
                  {agentService.delivery.title} <em>{`{${agentService.delivery.accent}}`}</em>
                </>
              }
              subtitle={agentService.delivery.description}
            />
            <div className="agent-delivery-journey">
              <svg className="agent-delivery-route" aria-hidden="true">
                <path className="agent-delivery-track" />
              </svg>
              <div className="agent-delivery-builder" aria-hidden="true">
                <Bot size={49} strokeWidth={1.5} />
                <Hammer className="builder-tool" size={27} />
              </div>
              <ol className="agent-delivery-steps" role="list">
                {agentService.delivery.steps.map((step, index) => (
                  <li className="agent-delivery-step" key={step.title}>
                    <span className="agent-delivery-number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="agent-delivery-copy">
                      <Title as="h3" variant="service">
                        {step.title}
                      </Title>
                      <p>{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="agent-delivery-remuneration">
              <SecondarySectionHeading
                title={
                  <>
                    {agentService.delivery.remunerationTitle}{' '}
                    <em>{`{${agentService.delivery.remunerationAccent}}`}</em>
                  </>
                }
              />
              <p>{agentService.delivery.remunerationDescription}</p>
            </div>
          </section>
        </div>
        <div className="section-band theme-dark">
          <ContactSection section={siteSection('contato')} artwork={contact} />
        </div>
      </main>
      <div className="footer-frame">
        <SectionShell section={siteSection('rodape')}>
          <FooterRunner bottomArtwork={footer} homePath="/" />
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
