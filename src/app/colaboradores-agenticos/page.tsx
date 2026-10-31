import type { Metadata } from 'next';
import { Bot, Hammer, User } from 'lucide-react';
import { AgentResultsCarousel } from '@/components/sections/agent-service/agent-results-carousel';
import { AgentOperationComparison } from '@/components/sections/agent-service/agent-operation-comparison';
import { AgentOperationScene } from '@/components/sections/agent-service/agent-operation-scene';
import { AgentFinanceDemo } from '@/components/sections/agent-service/agent-finance-demo';
import { SiteHeader } from '@/components/layout/header/site-header';
import { FooterRunner } from '@/components/layout/footer/footer-runner';
import { MotionRoot } from '@/components/motion/motion-root';
import { HeroTypewriter } from '@/components/sections/hero/hero-typewriter';
import { AgentScene } from '@/components/sections/hero/agent-scene';
import { ContactSection } from '@/components/sections/contact/contact-section';
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

export const metadata: Metadata = {
  title: 'Colaboradores agênticos — Beyond the Bytes',
  description: agentService.description,
};

export default async function AgentServicePage() {
  const roleIcons = [User, User, Bot];
  const [contact, footer] = await Promise.all([
    readNamespacedArtwork('contact', 'contact-art'),
    Promise.all(
      Array.from({ length: 10 }, (_, index) =>
        readArtwork(`footer-${index + 1}` as Parameters<typeof readArtwork>[0]).then(stripSvgXml),
      ),
    ),
  ]);

  return (
    <MotionRoot
      themeTrigger="#resultados .section-heading"
      themeReverse
      whatsappTrigger="#beneficios"
    >
      <SiteHeader section={siteSection('cabecalho')} homePath="/" mobileVariant="home" />
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
            <AgentScene scene={agentService.scene} />
          </div>
        </section>
        <div className="agent-service-content theme-dark">
          <section
            id="beneficios"
            className="agent-service-section"
            aria-label={agentService.benefits.label}
          >
            <SectionHeading
              label={agentService.benefits.label}
              title={
                <>
                  {agentService.benefits.title} <em>{`{${agentService.benefits.accent}}`}</em>
                </>
              }
            />
            <div className="agent-benefit-editorial">
              {agentService.benefits.items.map((item, index) => {
                return (
                  <article key={item.title} className="agent-benefit-item">
                    <div className="about-card-body">
                      <Title as="h3" variant="figma" className="about-card-title">
                        {index === 0 ? (
                          <>
                            Economia de até <strong className="agent-benefit-number">50%</strong> da
                            sua folha.
                          </>
                        ) : (
                          item.title
                        )}
                      </Title>
                      {item.description && <p className="about-card-copy">{item.description}</p>}
                    </div>
                  </article>
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
              className="agent-challenge-list agent-role-list"
              aria-label="Níveis de responsabilidade entre pessoas e IA"
            >
              {agentService.roles.items.map((item, index) => {
                const Icon = roleIcons[index];
                return (
                  <article key={item.title} className="about-panel-card">
                    <div className="about-card-body">
                      <div className="about-icon about-icon--lucide" aria-hidden="true">
                        <span
                          className={
                            index === 1
                              ? 'about-icon-surface agent-human-bot'
                              : 'about-icon-surface'
                          }
                        >
                          {index === 1 ? (
                            <>
                              <User strokeWidth={1.75} />
                              <Bot strokeWidth={1.75} />
                            </>
                          ) : (
                            <Icon strokeWidth={1.75} />
                          )}
                        </span>
                      </div>
                      <p className="agent-role-owner">{item.owner}</p>
                      <Title as="h3" variant="figma" className="about-card-title">
                        {item.title}
                      </Title>
                      <p className="about-card-copy">{item.description}</p>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="agent-roles-summary">
              <SecondarySectionHeading
                className="agent-roles-closing"
                subtitle="Colaboradores humanos naquilo que realmente importa."
                title={agentService.roles.closing.map((line) => (
                  <span className="agent-closing-line" key={line}>
                    {line}
                  </span>
                ))}
              />
              <p className="agent-remuneration-transition">
                O custo de não fazer nada é muito grande.
              </p>
            </div>
            <AgentOperationScene comparison={<AgentOperationComparison />} />
          </section>
          <section
            id="remuneracao"
            className="agent-service-section"
            aria-label={agentService.remuneration.label}
          >
            <SectionHeading
              label={agentService.remuneration.label}
              title={
                <>
                  {agentService.remuneration.title}{' '}
                  <em>{`{${agentService.remuneration.accent}}`}</em>
                </>
              }
            />
            <div className="agent-about-layout">
              <Artwork
                src="assets/servicos/agenticos-sobre.svg"
                width={1039}
                height={647}
                alt="Profissional ao lado de um robô trabalhando em uma estação de computador"
                className="agent-about-photo"
              />
              <div className="agent-service-prose">
                <p>{agentService.remuneration.description}</p>
                <p className="agent-service-statement">{agentService.remuneration.closing}</p>
              </div>
            </div>
          </section>
          <section
            id="resultados"
            className="agent-service-section"
            aria-label={agentService.results.label}
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
              label={agentService.results.label}
              title={
                <>
                  {agentService.results.title} <em>{`{${agentService.results.accent}}`}</em>
                </>
              }
              subtitle={agentService.results.description}
            />
            <AgentResultsCarousel items={agentService.illustrativeCases} />
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
            id="eficiencia"
            className="agent-service-section"
            aria-label={agentService.efficiency.label}
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
              label={agentService.efficiency.label}
              title={
                <>
                  {agentService.efficiency.title} <em>{`{${agentService.efficiency.accent}}`}</em>
                </>
              }
              subtitle={agentService.efficiency.description}
            />
            <AgentFinanceDemo />
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
                  {agentService.delivery.title} <em>{`{${agentService.delivery.accent}}`}</em>{' '}
                  {agentService.delivery.titleEnd}
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
          </section>
        </div>
        <div className="section-band theme-dark agent-contact-band">
          <div className="impact-patterns agent-contact-patterns" aria-hidden="true">
            <img
              className="impact-pattern impact-pattern-top-left"
              src="/assets/metricas/metrics-pattern-top-left.svg"
              alt=""
            />
            <img
              className="impact-pattern impact-pattern-top-right"
              src="/assets/metricas/padroes/vector 1.svg"
              alt=""
            />
          </div>
          <ContactSection section={siteSection('contato')} artwork={contact} />
        </div>
      </main>
      <div className="footer-frame footer-frame--home mx-auto">
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
