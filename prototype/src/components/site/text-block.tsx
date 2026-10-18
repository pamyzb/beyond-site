import { Fragment } from 'react';
import { actionFor, color, TYPE_TOKENS, type DesignBlock, type SectionData, type Style } from '@/lib/design';
import { Artwork } from './artwork';
import { HeroVideoWord } from './hero-video-word';
import { HeroTypewriter } from './hero-typewriter';
import { AppTitleWord } from './app-title-word';

export function TextBlock({ block, section }: { block: DesignBlock; section: SectionData }) {
  if(section.id==='inicio' && block.role==='h1') return <h1 className="hero-grid-title"><span>Tecnologia que</span><span className="hero-grid-title-bottom">move <HeroVideoWord /></span></h1>;
  const text = block.runs.map(r => r.text.trim()).join(' ');
  const href = actionFor(text, section.id);
  const menuItem = section.id === 'cabecalho' && href && !block.actionBox;
  const buttonIcon = block.actionBox && block.ancestors.find(name=>/^primary(?:_\d+)?$/.test(name));
  const Tag = href ? 'a' : text.startsWith('“') ? 'blockquote' : block.role === 'label' ? 'p' : block.role;
  const qr = block.ancestors.includes('qrcode-cta');
  const offstage = section.id === 'depoimentos' && block.runs.some(r => r.x < 0 || r.x > 1400);
  const badge = section.id === 'processo' && /^0[1-4]$/.test(text);
  const x = Math.min(...block.runs.map(r => r.origin?.[0] ?? r.x));
  const y = Math.min(...block.runs.map(r => r.origin?.[1] ?? r.y-r.size*.85));
  const style: Style = {'--x':`${x}px`, '--y':`${y}px`, '--mobile-size':`${Math.min(Math.max(block.runs[0].size,14),block.role==='h1'?62:block.role==='h2'?38:28)}px`};
  if (block.actionBox) {
    const [bx,by,bw,bh] = block.actionBox;
    Object.assign(style, {'--hit-x':`${bx-x}px`, '--hit-y':`${by-y}px`, '--hit-width':`${bw}px`, '--hit-height':`${bh}px`});
  }
  const classes = ['text-block',block.role==='label'&&'section-label',qr&&'qr-instructions',href&&'action-link',href&&block.actionBox&&'button-link',offstage&&'offstage-quote',badge&&'step-badge'].filter(Boolean).join(' ');
  return <Tag href={href} className={classes} style={style} data-source={block.source} data-role={block.role} aria-label={menuItem?text:undefined} aria-hidden={offstage || undefined}>
    {block.runs.map((run,i) => {
      const runStyle: Style = {left:run.x-x, top:run.y-y-run.size*.85,
        '--run-size': TYPE_TOKENS[run.size] ? `var(--text-${TYPE_TOKENS[run.size]})` : `${run.size}px`,
        fontWeight:block.role==='label'?'var(--weight-semibold)':href&&block.actionBox?500:Number(run.weight), fontStyle:run.italic?'italic':'normal', letterSpacing:run.tracking, color:color(run.color)};
      if (run.origin) Object.assign(runStyle, {transformOrigin:`${run.origin[0]-run.x}px ${run.origin[1]-run.y+run.size*.85}px`, transform:`rotate(${run.angle}deg)`});
      return <Fragment key={i}><span className={`text-run${section.id==='inicio'&&run.text==='negócios'?' textured-word':''}${menuItem?' menu-ink':''}`} style={runStyle} data-size={run.size}>{section.id==='inicio' && /software house/i.test(run.text) && /anos/i.test(run.text)?<HeroTypewriter text={run.text}/>:section.id==='aplicativo' && block.role==='h3' && ['palma','Experimente'].includes(run.text.trim())?<AppTitleWord text={run.text}/>:run.text}{menuItem && <>
        <span className="menu-bracket menu-bracket-left" aria-hidden="true" />
        <span className="menu-bracket menu-bracket-right" aria-hidden="true" />
        <svg className="menu-scribble" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="1" d="M3 7 C22 2 65 2 96 4 C78 5 41 7 20 9 C44 7 72 8 92 9" /></svg>
      </>}</span>{' '}</Fragment>;
    })}
    {buttonIcon && section.id!=='cabecalho' && <img className="button-art-icon" src={`/assets/figma/button-icon-${buttonIcon}.svg`} alt="" aria-hidden="true" />}
    {qr && <Artwork src="assets/figma/app-qr.svg" width={156} height={156} alt="QR Code para baixar o aplicativo Beyond" className="mobile-qr" />}
  </Tag>;
}

