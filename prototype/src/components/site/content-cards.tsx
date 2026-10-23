"use client";
import { ClientCarousel } from './client-carousel';
import { WHATSAPP, type DesignBlock, type SectionData, type Style } from '@/lib/design';
import { Fragment, type ReactNode } from 'react';
import { TextBlock } from './text-block';

import { AppArtwork } from './app-artwork';
import { ReflowArtwork } from './artwork';
import { AppFeatureCard } from './app-feature-card';
import { SectionHeading } from './section-heading';
import { Title } from './title';
import { HeroVideoWord } from './hero-video-word';
import { HeroTypewriter } from './hero-typewriter';
import { ButtonLink } from './button';
import layout from '../../../figma-layout.json';

const headerSection = layout.sections.find(section => section.id === 'cabecalho') as SectionData;

function headingRuns(runs: DesignBlock['runs']) {
  let previousY: number | undefined;
  return <>{runs.map((run,index)=>{
    const nextLine=previousY!==undefined && Math.abs(run.y-previousY)>1;
    previousY=run.y;
    return <Fragment key={`${run.text}-${run.y}-${index}`}>{nextLine && <br/>}{run.italic?<em>{run.text}</em>:<span>{run.text}</span>}</Fragment>;
  })}</>;
}

const art: Record<string,string> = {Article:'client-usp',Article_2:'client-pasteur',Article_3:'client-superpet',Article_10:'ai-visual',Article_11:'case-screen',container1:'phone-project','container 2':'phone-cases',Container_43:'testimonial-photo',Article_16:'about-16',Article_17:'about-17',Article_18:'about-18'};
const blog: Record<string,string> = {Article_19:'blog-19',Article_20:'blog-20',Sidebar:'blog-sidebar',Article_21:'blog-21',Article_23:'blog-19'};
function groupKey(block: DesignBlock, id: string) {
  if (id==='blog' && block.ancestors.includes('Sidebar')) return 'Sidebar';
  if (id==='aplicativo') return block.ancestors.find(k=>['container1','container 2'].includes(k));
  if (id==='depoimentos') return block.ancestors.find(k=>['Container_42','Container_43','Container_44'].includes(k));
  if (id==='metricas') return block.ancestors.find(k=>/^Paragraph_[456]$/.test(k));
  return block.ancestors.find(k=>/^Article(?:_\d+)?$/.test(k));
}
export function ContentCards({ section, appArtwork, className, children }: { section: SectionData; appArtwork?:Record<string,string>; className?: string; children?: ReactNode }) {
  if(section.id==='rodape')return null;
  if(section.id==='inicio'){
    const eyebrow=section.blocks.find(block=>block.role==='p'&&!block.actionBox&&block.ancestors.includes('Tags'));
    const title=section.blocks.find(block=>block.role==='h1');
    const description=section.blocks.find(block=>block.role==='p'&&!block.actionBox&&block.ancestors.includes('about'));
    const eyebrowText=eyebrow?.runs.map(run=>run.text.trim()).join(' ') ?? '';
    return <div className={['section-content',className].filter(Boolean).join(' ')}>
      <div className="hero-main">
        <div className="hero-copy">
          <p className="hero-eyebrow">{eyebrowText && <HeroTypewriter text={eyebrowText}/>}</p>
          {title&&<Title as="h1" variant="hero" className="hero-grid-title"><span>Tecnologia que</span><span className="hero-grid-title-bottom">move <HeroVideoWord /></span></Title>}
        </div>
        <div className="hero-bottom">
          {description&&<div className="hero-description-group"><img className="hero-description-arrow" src="/assets/figma/hero-description-arrow.svg" width={27} height={27} alt="" /><p className="hero-description" data-motion="static">{description.runs.map((run,index)=><span key={`${run.text}-${index}`} className="hero-description-line">{run.text.trim()}</span>)}</p></div>}
          <ButtonLink variant="primary-blue" className="hero-cta" href={WHATSAPP}><img className="hero-cta-icon" src="/assets/figma/form-whatsapp.svg" width={24} height={24} alt="" />Fale com um especialista</ButtonLink>
        </div>
      </div>
      <a className="hero-scroll-cue" href="#metricas" aria-label="Rolar para a próxima seção">
        <svg width="24" height="30" viewBox="0 0 24 30" fill="none" aria-hidden="true"><rect x="3" y="1" width="18" height="28" rx="9" stroke="currentColor" strokeWidth="1.5" /><path className="hero-scroll-wheel" d="M12 7v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </a>
    </div>;
  }
  const items: { key: string; card: boolean; blocks: DesignBlock[] }[] = [];
  const cards = new Map<string, typeof items[number]>();
  section.blocks.forEach((block,i)=>{
    if (section.id === 'rodape' && block.ancestors.some(name => name.startsWith('Navigation'))) return;
    const key = groupKey(block,section.id);
    if (!key) {items.push({key:`text-${i}`,card:false,blocks:[block]});return;}
    if (!cards.has(key)) {const card={key,card:true,blocks:[] as DesignBlock[]};cards.set(key,card);items.push(card);}
    cards.get(key)!.blocks.push(block);
  });
  const sharedHeading = ['aplicativo','depoimentos','faq','contato'].includes(section.id);
  const headingBlocks = sharedHeading ? section.blocks.filter(block=>block.ancestors.some(ancestor=>ancestor.startsWith('section-title'))) : [];
  const headingLabel = headingBlocks.find(block=>block.role==='label');
  const headingTitle = headingBlocks.find(block=>block.role==='h2');
  const headingSubtitle = headingBlocks.find(block=>block.role==='p');
  return <div className={['section-content', className].filter(Boolean).join(' ')}>
    {headingLabel && headingTitle && <SectionHeading className={`${section.id}-section-heading`} label={headingLabel.runs.map(run=>run.text.trim()).join(' ')} title={headingRuns(headingTitle.runs)} subtitle={headingSubtitle?.runs.map(run=>run.text.trim()).join(' ')} />}
    {section.id === 'rodape' && <nav className="footer-nav" aria-label="Navegação do rodapé">
      {headerSection.blocks.filter(block => !block.actionBox).map(block => <TextBlock key={block.source} block={block} section={headerSection} />)}
    </nav>}
    {items.map(item=>{
    if (!item.card && section.id==='clientes') return <Title variant="client-heading" className="client-heading" key={item.key}><img src="/assets/figma/section-title-icon.svg" width="18" height="18" alt="" /><span>Empresas que crescem com a Beyond</span></Title>;
    if (!item.card && headingBlocks.includes(item.blocks[0])) return null;
    if (!item.card) return <TextBlock key={item.key} block={item.blocks[0]} section={section} />;
    const style: Style = {};
    if (section.id==='processo' && item.key==='Article_14') style['--card-order']=4;
    if (section.id==='processo' && item.key==='Article_15') style['--card-order']=3;
    if (section.id==='blog' && blog[item.key]) style['--card-art']=`url("/assets/figma/${blog[item.key]}.svg")`;
    const artwork=art[item.key] && (appArtwork?.[art[item.key]] ? <AppArtwork svg={appArtwork[art[item.key]]} className="component-art"/> : <ReflowArtwork name={art[item.key]} />);
    const cardContent=<>{artwork}
      {item.blocks.map((block,i)=><TextBlock key={`${block.source}-${i}`} block={block} section={section} />)}</>;
    if(section.id==='aplicativo'){
      const title=item.blocks.find(block=>block.role==='h3');
      const qr=item.blocks.find(block=>block.ancestors.includes('qrcode-cta'));
      const copy=item.blocks.filter(block=>block!==title && block!==qr);
      const copyStack=<div className="app-feature-copy">
        {title && <TextBlock block={title} section={section} />}
        {copy.map((block,i)=><TextBlock key={`${block.source}-${i}`} block={block} section={section} />)}
        {qr && <TextBlock block={qr} section={section} />}
      </div>;
      return <AppFeatureCard key={item.key} source={item.key}>{item.key==='container1'?<>{artwork}{copyStack}</>:<>{copyStack}{artwork}</>}</AppFeatureCard>;
    }
    return <article key={item.key} className="content-card" data-source={item.key} data-motion="card" style={style}>
      {cardContent}
    </article>;
  })}{section.id==='conversa' && <ButtonLink variant="primary-blue" className="conversation-cta" href={WHATSAPP}><img className="conversation-cta-icon" src="/assets/figma/form-whatsapp.svg" width={24} height={24} alt="" />Fale com um especialista</ButtonLink>}{children}{section.id==='clientes' && <ClientCarousel clients={items.filter(item=>item.card).map(item=>({key:item.key,name:item.blocks[0].runs.map(run=>run.text).join(' '),summary:item.blocks.slice(1).map(block=>block.runs.map(run=>run.text).join(' ')).join(' '),image:'/assets/figma/'+art[item.key]+'.svg'}))} />}</div>;
}

