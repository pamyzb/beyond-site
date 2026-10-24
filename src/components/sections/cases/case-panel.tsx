import { ArrowUpRight, Check, Package, Route, Sparkles } from 'lucide-react';
import { SITE_LINKS } from '@/data/navigation';
import { Artwork } from '@/components/ui/artwork';
import { ButtonLink } from '@/components/ui/button';
import { Title } from '@/components/ui/title';
import type { CaseProject } from '@/data/cases';

function DemoScreen({ kind }: { kind: number }) {
  return (
    <div
      className={`case-demo-screen case-demo-${kind}`}
      aria-label={`Interface demonstrativa de ${kind === 1 ? 'Starlog' : 'Ayalla'}`}
    >
      <div className="case-demo-top">
        <strong>{kind === 1 ? 'starlog' : 'ayalla'}</strong>
        <span>Visão geral</span>
        <span className="case-demo-avatar">B</span>
      </div>
      <div className="case-demo-content">
        <p className="case-demo-overline">
          {kind === 1 ? 'OPERAÇÃO EM MOVIMENTO' : 'ESPAÇO PARA EVOLUIR'}
        </p>
        <Title as="h4" variant="case-demo">
          {kind === 1
            ? 'Cada entrega.\nUma visão completa.'
            : 'Tudo conectado.\nDe um jeito simples.'}
        </Title>
        <div className="case-demo-dashboard">
          <div className="case-demo-dashboard-title">
            {kind === 1 ? <Route size={20} /> : <Sparkles size={20} />}
            <span>{kind === 1 ? 'Acompanhe o percurso' : 'Sua próxima etapa'}</span>
            <ArrowUpRight size={18} />
          </div>
          {['Planejamento', 'Em andamento', 'Concluído'].map((text, index) => (
            <div className="case-demo-row" key={text}>
              <span className="case-demo-step">
                {index === 2 ? <Check size={14} /> : index + 1}
              </span>
              <span>{text}</span>
              <i style={{ width: `${75 - index * 17}%` }} />
            </div>
          ))}
        </div>
        <span className="case-demo-caption">Interface ilustrativa · demonstração</span>
      </div>
    </div>
  );
}

export function CasePanel({
  active,
  project,
  cta,
}: {
  active: number;
  project: CaseProject;
  cta: string;
}) {
  const quoteText = project.quote.replace(/^[“"]|[”"]$/g, '');
  return (
    <>
      <div className="case-browser-main">
        <div className="case-story">
          <p className="case-category">{project.category}</p>
          <Title as="h3" variant="case">
            {project.title}
          </Title>
          <p className="case-description">{project.description}</p>
          <div className="case-result">
            <strong>{project.result}</strong>
            <span>{project.resultCaption}</span>
          </div>
          <ButtonLink className="case-explore" href={SITE_LINKS.contact}>
            {cta}
            <img src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" />
          </ButtonLink>
        </div>
        <div className="case-visual">
          {active === 0 ? (
            <Artwork
              src="assets/figma/case-editorial-screen.svg"
              className="case-project-image"
              width={689}
              height={510}
            />
          ) : (
            <DemoScreen kind={active} />
          )}
        </div>
      </div>
      <footer className="case-testimonial">
        <span className="case-quote-mark" aria-hidden="true">
          “
        </span>
        <blockquote aria-label={quoteText}>
          {Array.from(quoteText).map((character, index) => (
            <span className="case-quote-character" aria-hidden="true" key={index}>
              {character}
            </span>
          ))}
        </blockquote>
        <div className="case-quote-author">
          {active === 0 ? (
            <>
              <Artwork
                src="assets/figma/testimonial-photo.svg"
                className="case-author-photo"
                width={64}
                height={64}
                alt=""
              />
              <p>
                <strong>{project.author.split(',')[0]}</strong>
                <span>{project.author.split(',').slice(1).join(',').trim()}</span>
              </p>
            </>
          ) : (
            <p>{project.author}</p>
          )}
        </div>
      </footer>
    </>
  );
}

export function CaseTabIcon({ index }: { index: number }) {
  return index === 0 ? (
    <Artwork
      src="assets/figma/client-pasteur.svg"
      className="case-tab-logo"
      width={24}
      height={24}
    />
  ) : index === 1 ? (
    <Package size={17} />
  ) : (
    <Sparkles size={17} />
  );
}
