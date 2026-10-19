"use client";
import { ClientCarousel } from './client-carousel';
import { type DesignBlock, type SectionData, type Style } from '@/lib/design';
import { TextBlock } from './text-block';

import { AppArtwork } from './app-artwork';
import { ReflowArtwork } from './artwork';
import layout from '../../../figma-layout.json';

const headerSection = layout.sections.find(section => section.id === 'cabecalho') as SectionData;

const art: Record<string,string> = {Article:'client-usp',Article_2:'client-pasteur',Article_3:'client-superpet',Article_10:'ai-visual',Article_11:'case-screen',container1:'phone-project','container 2':'phone-cases',Container_43:'testimonial-photo',Article_16:'about-16',Article_17:'about-17',Article_18:'about-18'};
const blog: Record<string,string> = {Article_19:'blog-19',Article_20:'blog-20',Sidebar:'blog-sidebar',Article_21:'blog-21',Article_23:'blog-19'};
function groupKey(block: DesignBlock, id: string) {
  if (id==='blog' && block.ancestors.includes('Sidebar')) return 'Sidebar';
  if (id==='aplicativo') return block.ancestors.find(k=>['container1','container 2'].includes(k));
  if (id==='depoimentos') return block.ancestors.find(k=>['Container_42','Container_43','Container_44'].includes(k));
  if (id==='metricas') return block.ancestors.find(k=>/^Paragraph_[456]$/.test(k));
  return block.ancestors.find(k=>/^Article(?:_\d+)?$/.test(k));
}
export function ContentCards({ section, appArtwork }: { section: SectionData; appArtwork?:Record<string,string> }) {
  const items: { key: string; card: boolean; blocks: DesignBlock[] }[] = [];
  const cards = new Map<string, typeof items[number]>();
  section.blocks.forEach((block,i)=>{
    if (section.id === 'rodape' && block.ancestors.some(name => name.startsWith('Navigation'))) return;
    const key = groupKey(block,section.id);
    if (!key) {items.push({key:`text-${i}`,card:false,blocks:[block]});return;}
    if (!cards.has(key)) {const card={key,card:true,blocks:[] as DesignBlock[]};cards.set(key,card);items.push(card);}
    cards.get(key)!.blocks.push(block);
  });
  return <><div className="section-content">
    {section.id === 'rodape' && <nav className="footer-nav" aria-label="Navegação do rodapé">
      {headerSection.blocks.filter(block => !block.actionBox).map(block => <TextBlock key={block.source} block={block} section={headerSection} />)}
    </nav>}
    {items.map(item=>{
    if (!item.card && section.id==='clientes') return <h2 className="client-heading" key={item.key}><img src="/assets/figma/section-title-icon.svg" width="18" height="18" alt="" /><span>Empresas que crescem com a Beyond</span></h2>;
    if (!item.card) return <TextBlock key={item.key} block={item.blocks[0]} section={section} />;
    const style: Style = {};
    if (section.id==='processo' && item.key==='Article_14') style['--card-order']=4;
    if (section.id==='processo' && item.key==='Article_15') style['--card-order']=3;
    if (section.id==='blog' && blog[item.key]) style['--card-art']=`url("/assets/figma/${blog[item.key]}.svg")`;
    return <article key={item.key} className="content-card" data-source={item.key} data-motion="card" style={style}>
      {art[item.key] && (appArtwork?.[art[item.key]] ? <AppArtwork svg={appArtwork[art[item.key]]} className="component-art"/> : <ReflowArtwork name={art[item.key]} />)}
      {item.blocks.map((block,i)=><TextBlock key={`${block.source}-${i}`} block={block} section={section} />)}
    </article>;
  })}</div>{section.id==='clientes' && <ClientCarousel clients={items.filter(item=>item.card).map(item=>({key:item.key,name:item.blocks[0].runs.map(run=>run.text).join(' '),summary:item.blocks.slice(1).map(block=>block.runs.map(run=>run.text).join(' ')).join(' '),image:'/assets/figma/'+art[item.key]+'.svg'}))} />}</>;
}

