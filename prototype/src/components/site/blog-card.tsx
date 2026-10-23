import type { DesignBlock } from '@/lib/design';
import { Title } from './title';

export type BlogCardData={key:string;art:string;width:number;height:number};

export function BlogCard({card,blocks,id,layout}:{card:BlogCardData;blocks:DesignBlock[];id:string;layout:string}) {
  const title=blocks.find(block=>block.role==='h3')!.runs.map(run=>run.text.trim()).join(' ');
  const paragraphs=blocks.filter(block=>block.role==='p');
  return <article className={`blog-card blog-card--${layout}`}>
    <img className="blog-card-image" src={`/assets/figma/${card.art}-background.svg`} alt="" loading="lazy" />
    <span className="blog-tag"><img src={`/assets/figma/${card.art}-tag.svg`} width={card.width} height={card.height} alt={card.key==='Article_20'?'Beyond the Bytes':'Veja'} /></span>
    <div className="blog-card-copy"><Title as="h3" variant="blog-card" id={id}>{title}</Title>{paragraphs.map((block,index)=><p key={block.source} className={index===paragraphs.length-1?'blog-byline':undefined}>{block.runs.map(run=>run.text.trim()).join(' ')}</p>)}</div>
    <button type="button" className="blog-card-hit" aria-labelledby={id} />
  </article>;
}
