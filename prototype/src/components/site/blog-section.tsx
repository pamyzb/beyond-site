"use client";
import { useState } from 'react';
import type { SectionData } from '@/lib/design';
import { TextBlock } from './text-block';

const cards = [
  { key: 'Article_19', art: 'blog-19', width: 204, height: 34 },
  { key: 'Article_20', art: 'blog-20', width: 170, height: 25 },
  { key: 'Sidebar', art: 'blog-sidebar', width: 68, height: 34 },
  { key: 'Article_21', art: 'blog-21', width: 136, height: 34 },
];

export function BlogSection({ section }: { section: SectionData }) {
  const [expanded, setExpanded] = useState(false);
  return <section id="blog" aria-label={section.label} data-motion="section" className="design-section section-blog blog-bento theme-dark">
    <div className="section-content blog-heading">
      {section.blocks.filter(block => block.role === 'label' || block.role === 'h2').map(block => <TextBlock key={block.source} block={block} section={section} />)}
    </div>
    <div id="blog-posts" className="blog-posts">
      {Array.from({ length: expanded ? 2 : 1 }, (_, group) => <div className={group ? 'blog-reveal' : undefined} key={group}><div className={group ? 'blog-reveal-inner' : undefined}><div className={`blog-grid${group ? ' blog-grid-alternate' : ''}`}>
        {(group ? [cards[3], cards[0], cards[1], cards[2]] : cards).map((card, index) => {
          const blocks = section.blocks.filter(block => block.ancestors.includes(card.key));
          const title = blocks.find(block => block.role === 'h3')!.runs.map(run => run.text.trim()).join(' ');
          const paragraphs = blocks.filter(block => block.role === 'p');
          const id = `blog-post-${group}-${index}`;
          return <article className="blog-card" key={card.key}>
            <img className="blog-card-image" src={`/assets/figma/${card.art}-background.svg`} alt="" loading="lazy" />
            <span className="blog-tag"><img src={`/assets/figma/${card.art}-tag.svg`} width={card.width} height={card.height} alt={card.key === 'Article_20' ? 'Beyond the Bytes' : 'Veja'} /></span>
            <div className="blog-card-copy">
              <h3 id={id}>{title}</h3>
              {paragraphs.map((block, i) => <p key={block.source} className={i === paragraphs.length - 1 ? 'blog-byline' : undefined}>{block.runs.map(run => run.text.trim()).join(' ')}</p>)}
            </div>
            <button type="button" className="blog-card-hit" aria-labelledby={id} />
          </article>;
        })}
      </div></div></div>)}
    </div>
    <div className="blog-actions">
      <button type="button" className="button button-lime blog-more" aria-expanded={expanded} aria-controls={expanded ? undefined : 'blog-posts'} onClick={() => { if (!expanded) setExpanded(true); }}>
        <span className="button-label">{expanded ? 'Ir para o blog' : '+ Mostrar mais'}</span>
        {expanded && <img className="button-icon" src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" />}
      </button>
      <span className="blog-status" role="status">{expanded ? 'Mais 4 posts exibidos. 8 posts no total.' : ''}</span>
    </div>
  </section>;
}
