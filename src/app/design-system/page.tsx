import type { Metadata } from 'next';
import { ArrowUpRight, Check, Code2, Palette, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactField } from '@/components/sections/contact/contact-field';
import { CountUp } from '@/components/sections/metrics/count-up';
import { FaqAccordion } from '@/components/sections/faq/faq-accordion';
import { LanguageSelector } from '@/components/layout/header/language-selector';
import { ServiceCard } from '@/components/sections/services/service-card';
import { SecondarySectionHeading } from '@/components/ui/secondary-section-heading';
import { Title } from '@/components/ui/title';
import styles from '@/app/design-system/page.module.css';

export const metadata: Metadata = {
  title: 'Inventário visual — Beyond',
  description: 'Componentes e tokens usados na V1 do site Beyond.',
};

const colorGroups = [
  {
    label: 'Marca',
    items: [
      ['primary-700', '--color-primary-700', '#2F43FC'],
      ['primary-900', '--color-primary-900', '#0B2C65'],
      ['secondary', '--color-secondary', '#AAED35'],
      ['ink', '--color-ink', '#08090B'],
    ],
  },
  {
    label: 'Superfícies',
    items: [
      ['page', '--color-page', '#FFFFFF'],
      ['surface', '--color-surface', '#F6F8FB'],
      ['surface-inverse', '--color-surface-inverse', '#15191F'],
      ['surface-blog', '--color-surface-blog', '#161B29'],
    ],
  },
  {
    label: 'Texto e interface',
    items: [
      ['text', '--color-text', '#000000'],
      ['text-subtle', '--color-text-subtle', '#4B5563'],
      ['border-soft', '--color-border-soft', '#DFE5EF'],
      ['error', '--color-error', '#FF595E'],
    ],
  },
];

const typeTokens = [
  ['Hero', '--text-hero', '11.75rem', 'Título de abertura'],
  ['Display', '--text-display', '9.5rem', 'Destaques muito grandes'],
  ['Heading', '--text-heading', '4.5rem', 'Títulos de seção'],
  ['Subheading', '--text-subheading', '2.75rem', 'Subtítulos e métricas'],
  ['Section H2', '--text-section-h2', '2.5rem', 'Variação editorial de segunda hierarquia'],
  ['Card', '--text-card', '1.5rem', 'Títulos de cartões'],
  ['Body large', '--text-body-lg', '1.125rem', 'Texto de destaque'],
  ['Body', '--text-body', '1rem', 'Texto corrente'],
  ['Small', '--text-small', '0.875rem', 'Navegação e apoio'],
  ['Caption', '--text-caption', '0.75rem', 'Rótulos e metadados'],
  ['Micro', '--text-micro', '0.6875rem', 'Detalhes compactos'],
];

const componentGroups = [
  [
    'Base',
    [
      'Button / ButtonLink',
      'Title',
      'SecondarySectionHeading',
      'Artwork',
      'TextBlock',
      'SectionHeading',
    ],
  ],
  [
    'Navegação',
    ['SiteHeader', 'HeaderNavigation', 'LanguageSelector', 'FooterContent', 'FooterRunner'],
  ],
  [
    'Conteúdo',
    ['ServiceCard', 'BlogCard', 'AboutCard', 'ProcessCard', 'AppFeatureCard', 'CasePanel'],
  ],
  [
    'Interação',
    [
      'ContactForm',
      'ContactField',
      'FaqAccordion',
      'FaqItem',
      'TestimonialCarousel',
      'ClientCarousel',
    ],
  ],
  [
    'Movimento e arte',
    [
      'MotionRoot',
      'ButtonMotion',
      'CountUp',
      'HeroGlass',
      'HeroInk',
      'HeroTypewriter',
      'HeroVideoWord',
    ],
  ],
];

export default function DesignSystemPage() {
  return (
    <main className={styles.page} id="inicio">
      <header className={styles.hero}>
        <a className={styles.back} href="/">
          ← Voltar para a V1
        </a>
        <p className={styles.eyebrow}>
          <Code2 size={16} aria-hidden="true" /> Inventário da V1
        </p>
        <h1>
          O que virou
          <br />
          <em>componente</em>
        </h1>
        <p className={styles.intro}>
          Esta página expõe a base real do site: componentes React reutilizados e os tokens
          definidos em <code>tokens.css</code>.
        </p>
        <nav className={styles.jump} aria-label="Navegação desta página">
          <a href="#componentes">Componentes</a>
          <a href="#cores">Cores</a>
          <a href="#tipografia">Texto</a>
        </nav>
      </header>

      <section className={styles.section} id="componentes">
        <div className={styles.sectionLead}>
          <span>
            <Code2 size={20} />
          </span>
          <div>
            <p className={styles.kicker}>Catálogo</p>
            <h2>Componentes identificados</h2>
          </div>
          <p>
            Peças que aparecem mais de uma vez ou encapsulam comportamento e estrutura de uma seção.
          </p>
        </div>
        <div className={styles.componentGroups}>
          {componentGroups.map(([group, components]) => (
            <article className={styles.componentGroup} key={group as string}>
              <h3>{group}</h3>
              <div>
                {(components as string[]).map((component) => (
                  <span key={component}>{component}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className={styles.galleryIntro}>
          <p className={styles.kicker}>Vitrine</p>
          <h3>A aparência dos elementos no site</h3>
          <p>
            Estes são os componentes renderizados, não ilustrações genéricas. Alguns aparecem em
            versão reduzida para caberem lado a lado.
          </p>
        </div>
        <div className={styles.gallery}>
          <article className={`${styles.preview} ${styles.previewNavigation}`}>
            <div className={styles.previewLabel}>
              Navegação · HeaderNavigation + LanguageSelector
            </div>
            <div className={styles.miniNav}>
              <strong>
                beyond
                <br />
                <i>the bytes</i>
              </strong>
              <nav>
                <a>Cases</a>
                <a>Serviços</a>
                <a>Processo</a>
                <a>Contato</a>
              </nav>
              <LanguageSelector />
              <Button variant="primary-blue">Fale com a Beyond</Button>
            </div>
          </article>
          <article className={`${styles.preview} ${styles.previewService}`}>
            <div className={styles.previewLabel}>Conteúdo · ServiceCard</div>
            <ServiceCard
              title="Produtos digitais"
              description="Sistemas e plataformas feitos para o seu negócio crescer."
              image="/assets/servicos/service-ai-team.png"
              imageClass=""
              cta="Ver detalhes"
              href="#componentes"
            />
          </article>
          <article className={`${styles.preview} ${styles.previewFaq}`}>
            <div className={styles.previewLabel}>Interação · FaqAccordion</div>
            <FaqAccordion />
          </article>
          <article className={`${styles.preview} ${styles.previewMetric}`}>
            <div className={styles.previewLabel}>Movimento · CountUp</div>
            <p>Projetos que geram impacto</p>
            <CountUp value={92} suffix="%" />
            <span>de aprovação dos clientes</span>
          </article>
        </div>

        <div className={styles.showcase}>
          <article>
            <p className={styles.kicker}>Button</p>
            <h3>Ações e variantes</h3>
            <div className={styles.buttonRow}>
              <Button variant="primary-blue">
                Falar com a Beyond <ArrowUpRight size={18} />
              </Button>
              <Button variant="primary-lime">
                Ver projeto <ArrowUpRight size={18} />
              </Button>
              <Button variant="secondary">Saiba mais</Button>
            </div>
          </article>
          <article>
            <p className={styles.kicker}>Title</p>
            <h3>Hierarquia de título</h3>
            <Title variant="service" as="h4" className={styles.titleExample}>
              Tecnologia para
              <br />
              <em>mover negócios.</em>
            </Title>
          </article>
          <article>
            <p className={styles.kicker}>SecondarySectionHeading</p>
            <SecondarySectionHeading
              as="h4"
              title={
                <>
                  O código é só uma <em>{'{parte}'}</em> do trabalho
                </>
              }
              subtitle="Texto de apoio alinhado à direita."
            />
          </article>
          <article>
            <p className={styles.kicker}>ContactField</p>
            <h3>Campo de formulário</h3>
            <ContactField
              kind="input"
              name="exemplo"
              title="Seu melhor e-mail"
              placeholder="nome@empresa.com"
            />
          </article>
        </div>
      </section>

      <section className={`${styles.section} ${styles.colors}`} id="cores">
        <div className={styles.sectionLead}>
          <span>
            <Palette size={20} />
          </span>
          <div>
            <p className={styles.kicker}>Tokens de cor</p>
            <h2>Paleta em uso</h2>
          </div>
          <p>O nome técnico é o token usado no CSS. A amostra mostra a cor que ele resolve hoje.</p>
        </div>
        <div className={styles.colorGroups}>
          {colorGroups.map((group) => (
            <article key={group.label}>
              <h3>{group.label}</h3>
              <div className={styles.swatches}>
                {group.items.map(([name, token, hex]) => (
                  <div className={styles.swatch} key={token}>
                    <i style={{ background: `var(${token})` }} />
                    <strong>{name}</strong>
                    <code>{token}</code>
                    <small>{hex}</small>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className={styles.semantic}>
          <p>Tokens semânticos</p>
          <div>
            {[
              '--color-action',
              '--color-action-hover',
              '--color-accent',
              '--color-focus',
              '--color-on-action',
              '--color-on-accent',
            ].map((token) => (
              <code key={token}>{token}</code>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="tipografia">
        <div className={styles.sectionLead}>
          <span>
            <Type size={20} />
          </span>
          <div>
            <p className={styles.kicker}>Tokens de texto</p>
            <h2>Escala tipográfica</h2>
          </div>
          <p>Poppins é a família única da V1, com pesos de 300, 400, 500, 600 e 700.</p>
        </div>
        <div className={styles.typeTable}>
          {typeTokens.map(([name, token, size, use]) => (
            <div className={styles.typeRow} key={token}>
              <div className={styles.typeSample} style={{ fontSize: `var(${token})` }}>
                Aa
              </div>
              <div>
                <strong>{name}</strong>
                <code>{token}</code>
              </div>
              <span>{size}</span>
              <p>{use}</p>
            </div>
          ))}
        </div>
        <div className={styles.foundations}>
          <div>
            <Check size={18} />
            <strong>Pesos</strong>
            <span>300 · 400 · 500 · 600 · 700</span>
          </div>
          <div>
            <Check size={18} />
            <strong>Entrelinhas</strong>
            <span>1 · 1.15 · 1.25 · 1.5 · 1.6</span>
          </div>
          <div>
            <Check size={18} />
            <strong>Espaçamento</strong>
            <span>0.25 · 0.5 · 0.75 · 1 · 1.5 · 2 · 2.5 · 3.75 · 5 · 7.5 rem</span>
          </div>
        </div>
      </section>
    </main>
  );
}
