import { Fragment } from 'react';
import { actionFor, color, fontWeight, tracking, TYPE_TOKENS, type DesignBlock, type SectionData, type Style } from '@/lib/design';
import { Artwork } from './artwork';
import { HeroVideoWord } from './hero-video-word';
import { HeroTypewriter } from './hero-typewriter';
import { AppTitleWord } from './app-title-word';
import { Title } from './title';

export function TextBlock({ block, section }: { block: DesignBlock; section: SectionData }) {
  if(section.id==='inicio' && block.role==='h1') return <Title as="h1" variant="hero" className="hero-grid-title"><span>Tecnologia que</span><span className="hero-grid-title-bottom">move <HeroVideoWord /></span></Title>;
  // The hero artwork has no contextual CTA. Keep only the header action and avoid rendering its exported hit box.
  if(section.id==='inicio' && block.actionBox) return null;
  const text = block.runs.map(r => r.text.trim()).join(' ');
  const mapsButton = section.id === 'rodape' && text === 'Ver a rota no Maps';
  // This secondary CTA's hit box is missing from the exported text metadata.
  if (mapsButton) block = { ...block, actionBox: [584.5, 628.01, 271, 39] };
  const href = actionFor(text, section.id);
  // The conversation section keeps its visual focus on the invitation and imagery; its exported CTA is intentionally omitted.
  if (section.id === 'conversa' && href) return null;
  const menuItem = section.id === 'cabecalho' && href && !block.actionBox;
  const buttonIcon = block.actionBox && block.ancestors.find(name=>/^primary(?:_\d+)?$/.test(name));
  const Tag = href ? 'a' : text.startsWith('“') ? 'blockquote' : block.role === 'label' ? 'p' : block.role;
  const qr = block.ancestors.includes('qrcode-cta');
  if(qr)return <div className="qr-instructions" data-source={block.source} aria-label="Instruções para baixar o aplicativo"><span className="qr-hover-fill" aria-hidden="true"/><div className="app-qr-surface"><Artwork src="assets/figma/app-qr.svg" width={156} height={156} alt="QR Code para baixar o aplicativo Beyond" className="app-qr-image"/></div><p>Escaneie o QR Code <br/>para baixar o app!</p></div>;
  const appFeatureTitle = section.id==='aplicativo' && block.role==='h3' && ['Seu projeto na palma da mão','Experimente o nosso trabalho'].includes(text);
  if (appFeatureTitle) {
    const x = Math.min(...block.runs.map(r => r.origin?.[0] ?? r.x));
    const y = Math.min(...block.runs.map(r => r.origin?.[1] ?? r.y-r.size*.85));
    const style: Style = {'--x':`${x}px`, '--y':`${y}px`, '--mobile-size':`${Math.min(Math.max(block.runs[0].size,14),28)}px`};
    return <Title as="h3" variant="app-feature" className="text-block app-feature-title" style={style} data-source={block.source} data-role="h3">
      {text === 'Seu projeto na palma da mão' ? <><span className="app-feature-title-line">Seu projeto na</span><span className="app-feature-title-line"><AppTitleWord text="palma"/> da mão</span></> : <><span className="app-feature-title-line"><AppTitleWord text="Experimente"/> o nosso</span><span className="app-feature-title-line">trabalho</span></>}
    </Title>;
  }
  const offstage = section.id === 'depoimentos' && block.runs.some(r => r.x < 0 || r.x > 1400);
  const badge = section.id === 'processo' && /^0[1-4]$/.test(text);
  // Conversation copy is an ordinary heading/copy/action group. It used to
  // inherit the Figma canvas coordinates even though it has no overlapping
  // semantic siblings.
  const flowCopy = section.id==='conversa';
  const x = Math.min(...block.runs.map(r => r.origin?.[0] ?? r.x));
  const y = Math.min(...block.runs.map(r => r.origin?.[1] ?? r.y-r.size*.85));
  const style: Style = {'--x':`${x}px`, '--y':`${y}px`, '--mobile-size':`${Math.min(Math.max(block.runs[0].size,14),block.role==='h1'?62:block.role==='h2'?38:28)}px`};
  if (block.actionBox) {
    const [bx,by,bw,bh] = block.actionBox;
    Object.assign(style, {'--hit-x':`${bx-x}px`, '--hit-y':`${by-y}px`, '--hit-width':`${bw}px`, '--hit-height':`${bh}px`});
  }
  const classes = ['text-block',flowCopy&&'flow-copy',flowCopy&&`flow-copy--${block.role}`,block.role==='label'&&'section-label',qr&&'qr-instructions',href&&'action-link',href&&block.actionBox&&'button-link',offstage&&'offstage-quote',badge&&'step-badge'].filter(Boolean).join(' ');
  const content = <>
    {buttonIcon && section.id==='conversa' && <img className="conversation-mobile-button-icon" src="/assets/figma/form-whatsapp.svg" alt="" aria-hidden="true" />}
    {block.runs.map((run,i) => {
      const runStyle: Style = {left:run.x-x, top:run.y-y-run.size*.85,
        '--run-size': TYPE_TOKENS[run.size] ? `var(--text-${TYPE_TOKENS[run.size]})` : `${run.size}px`,
        fontWeight:block.role==='label'?'var(--weight-semibold)':href&&block.actionBox?'var(--weight-medium)':fontWeight(run.weight), fontStyle:run.italic?'italic':'normal', letterSpacing:tracking(run.tracking), color:color(run.color)};
      if (run.origin) Object.assign(runStyle, {transformOrigin:`${run.origin[0]-run.x}px ${run.origin[1]-run.y+run.size*.85}px`, transform:`rotate(${run.angle}deg)`});
      return <Fragment key={i}><span className={`text-run${section.id==='inicio'&&run.text==='negócios'?' textured-word':''}${menuItem?' menu-ink':''}`} style={runStyle} data-size={run.size}>{section.id==='inicio' && /software house/i.test(run.text) && /anos/i.test(run.text)?<HeroTypewriter text={run.text}/>:section.id==='aplicativo' && block.role==='h3' && ['palma','Experimente'].includes(run.text.trim())?<AppTitleWord text={run.text.trim()}/>:run.text.replaceAll('[','{').replaceAll(']','}')}{menuItem && <>
        <span className="menu-bracket menu-bracket-left" aria-hidden="true" />
        <span className="menu-bracket menu-bracket-right" aria-hidden="true" />
        <svg className="menu-scribble" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="1" d="M3 7 C22 2 65 2 96 4 C78 5 41 7 20 9 C44 7 72 8 92 9" /></svg>
      </>}</span>{' '}</Fragment>;
    })}
    {buttonIcon && section.id!=='cabecalho' && <img className="button-art-icon" src={`/assets/figma/button-icon-${buttonIcon}.svg`} alt="" aria-hidden="true" />}
    {mapsButton && <img className="button-art-icon" src="/assets/figma/button-icon-maps.svg" alt="" aria-hidden="true" />}
    {qr && <Artwork src="assets/figma/app-qr.svg" width={156} height={156} alt="QR Code para baixar o aplicativo Beyond" className="mobile-qr" />}
  </>;
  if (!href && (block.role==='h1' || block.role==='h2' || block.role==='h3')) return <Title as={block.role} variant="figma" className={classes} style={style} data-source={block.source} data-role={block.role} aria-hidden={offstage || undefined}>{content}</Title>;
  return <Tag href={href} className={classes} style={style} data-source={block.source} data-role={block.role} data-motion={block.role==='p' && block.ancestors.some(name=>name.startsWith('section-title'))?'section-description':undefined} aria-label={menuItem?text:undefined} aria-hidden={offstage || undefined}>{content}</Tag>;
}

