'use client';
import { useState } from 'react';
import type { SectionData } from '@/lib/figma/design';
import { BlogCard, type BlogCardData } from '@/components/sections/blog/blog-card';
import { SectionHeading } from '@/components/ui/section-heading';

const cards: BlogCardData[] = [
  { key: 'Article_19', art: 'blog-19', width: 204, height: 34 },
  { key: 'Article_20', art: 'blog-20', width: 170, height: 25 },
  { key: 'Sidebar', art: 'blog-sidebar', width: 68, height: 34 },
  { key: 'Article_21', art: 'blog-21', width: 136, height: 34 },
];

export function BlogSection({ section }: { section: SectionData }) {
  const [expanded, setExpanded] = useState(false);
  const label =
    section.blocks
      .find((block) => block.role === 'label')
      ?.runs.map((run) => run.text.trim())
      .join(' ') ?? 'BLOG';
  const heading = section.blocks.find((block) => block.role === 'h2');
  return (
    <section
      id="blog"
      aria-label={section.label}
      data-motion="section"
      className="design-section section-blog blog-bento theme-dark"
    >
      {heading && (
        <SectionHeading
          className="blog-heading"
          label={label}
          title={
            <>
              {heading.runs.map((run, index) =>
                run.italic ? <em key={index}>{run.text}</em> : run.text,
              )}
            </>
          }
        />
      )}
      <div id="blog-posts" className="blog-posts">
        {Array.from({ length: expanded ? 2 : 1 }, (_, group) => (
          <div className={group ? 'blog-reveal' : undefined} key={group}>
            <div className={group ? 'blog-reveal-inner' : undefined}>
              <div className={`blog-grid${group ? ' blog-grid-alternate' : ''}`}>
                {(group ? [cards[3], cards[0], cards[1], cards[2]] : cards).map((card, index) => {
                  const blocks = section.blocks.filter((block) =>
                    block.ancestors.includes(card.key),
                  );
                  const id = `blog-post-${group}-${index}`;
                  return (
                    <BlogCard
                      key={card.key}
                      card={card}
                      blocks={blocks}
                      id={id}
                      layout={`slot-${index}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="blog-actions">
        <button
          type="button"
          className="button button-lime blog-more"
          aria-expanded={expanded}
          aria-controls="blog-posts"
          onClick={() => {
            if (!expanded) setExpanded(true);
          }}
        >
          <span className="button-label">{expanded ? 'Ir para o blog' : '+ Mostrar mais'}</span>
          {expanded && (
            <img
              className="button-icon"
              src="/assets/compartilhados/header-button-arrow.svg"
              width={18}
              height={18}
              alt=""
            />
          )}
        </button>
        <span className="blog-status" role="status">
          {expanded ? 'Mais 4 posts exibidos. 8 posts no total.' : ''}
        </span>
      </div>
    </section>
  );
}
