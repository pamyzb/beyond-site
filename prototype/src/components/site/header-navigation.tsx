import type { SectionData } from '@/lib/design';
import { actionFor } from '@/lib/design';
import { LanguageSelector } from './language-selector';

export function HeaderNavigation({section,onNavigate}:{section:SectionData;onNavigate:()=>void}) {
  const links=section.blocks.filter(block=>!block.actionBox);
  const action=section.blocks.find(block=>block.actionBox);
  return <nav className="desktop-nav" id="mobile-navigation" aria-label="Navegação principal" onClick={event=>{if((event.target as Element).closest('a'))onNavigate();}}>
    <div className="header-nav-links">
      {links.map(block=>{
        const label=block.runs.map(run=>run.text).join(' ');
        return <a key={block.source} className="action-link header-nav-link" href={actionFor(label,section.id)} aria-label={label}>
          <span className="menu-ink">{label}<span className="menu-bracket menu-bracket-left" aria-hidden="true" /><span className="menu-bracket menu-bracket-right" aria-hidden="true" /><svg className="menu-scribble" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path pathLength="1" d="M3 7 C22 2 65 2 96 4 C78 5 41 7 20 9 C44 7 72 8 92 9" /></svg></span>
        </a>;
      })}
    </div>
    <LanguageSelector />
    {action&&<a className="button header-cta" href={actionFor(action.runs.map(run=>run.text).join(' '),section.id)}><span className="button-label">{action.runs.map(run=>run.text).join(' ')}</span><img className="button-icon" src="/assets/figma/header-button-arrow.svg" width={18} height={18} alt="" /></a>}
  </nav>;
}
