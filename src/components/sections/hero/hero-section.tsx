import type { SectionData } from '@/lib/figma/design';
import { blockText } from '@/lib/figma/content';
import { WHATSAPP } from '@/data/navigation';
import { Artwork } from '@/components/ui/artwork';
import { Title } from '@/components/ui/title';
import { ButtonLink } from '@/components/ui/button';
import { SectionShell } from '@/components/sections/shared/section-shell';
import { HeroTypewriter } from './hero-typewriter';
import { HeroVideoWord } from './hero-video-word';
import { HeroInk } from './hero-ink';
import { HeroGlass } from './hero-glass';
export function HeroSection({ section }: { section: SectionData }) {
  const eyebrow = section.blocks.find(
    (block) => block.role === 'p' && block.ancestors.includes('Tags'),
  );
  const title = section.blocks.find((block) => block.role === 'h1');
  const description = section.blocks.find(
    (block) => block.role === 'p' && block.ancestors.includes('about'),
  );
  return (
    <SectionShell section={section}>
      <Artwork
        src="assets/generated/hero-background.svg"
        width={1440}
        height={section.height}
        lazy={false}
        className="figma-art bleed-art"
      />
      <div className="section-content section-content--inicio">
        <div className="hero-main">
          <div className="hero-copy">
            <p className="hero-eyebrow">
              {eyebrow && <HeroTypewriter text={blockText(eyebrow)} />}
            </p>
            {title && (
              <Title as="h1" variant="hero" className="hero-grid-title">
                <span>Tecnologia que</span>
                <span className="hero-grid-title-bottom">
                  move <HeroVideoWord />
                </span>
              </Title>
            )}
          </div>
          <div className="hero-bottom">
            {description && (
              <div className="hero-description-group">
                <img
                  className="hero-description-arrow"
                  src="/assets/inicio/hero-description-arrow.svg"
                  width={27}
                  height={27}
                  alt=""
                />
                <p className="hero-description" data-motion="static">
                  {description.runs.map((run, index) => (
                    <span key={`${run.text}-${index}`} className="hero-description-line">
                      {run.text.trim()}
                    </span>
                  ))}
                </p>
              </div>
            )}
            <ButtonLink variant="primary-blue" className="hero-cta" href={WHATSAPP}>
              <img
                className="hero-cta-icon"
                src="/assets/compartilhados/form-whatsapp.svg"
                width={24}
                height={24}
                alt=""
              />
              Fale com um especialista
            </ButtonLink>
          </div>
        </div>
        <a className="hero-scroll-cue" href="#metricas" aria-label="Rolar para a próxima seção">
          <svg width="24" height="30" viewBox="0 0 24 30" fill="none" aria-hidden="true">
            <rect
              x="3"
              y="1"
              width="18"
              height="28"
              rx="9"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              className="hero-scroll-wheel"
              d="M12 7v5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </a>
      </div>
      <HeroInk />
      <HeroGlass />
    </SectionShell>
  );
}
