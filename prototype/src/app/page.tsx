import { readFile } from 'node:fs/promises';
import path from 'node:path';
import layout from '../../figma-layout.json';
import { type DesignData, WHATSAPP } from '@/lib/design';
import { SiteHeader } from '@/components/site/site-header';
import { MetricsSection } from '@/components/site/metrics-section';
import { DesignSection } from '@/components/site/design-section';
import { Artwork } from '@/components/site/artwork';
import { AboutSection } from '@/components/site/about-section';
import { ProcessSection } from '@/components/site/process-section';
import { readProcessArtwork } from '@/lib/process-artwork';
import { MotionRoot } from '@/components/motion/motion-root';

export default async function Home() {
  const {sections}=layout as DesignData;
  const processArtwork=await readProcessArtwork();
  const footerArtwork=await Promise.all(Array.from({length:10},(_,index)=>readFile(path.join(process.cwd(),'public/assets/footer',`bottom-${index+1}.svg`),'utf8').then(svg=>svg.replace(/<\?xml[^>]*\?>/,''))));
  const aboutIcons=await Promise.all([16,17,18].map(async id=>{
    let svg=await readFile(path.join(process.cwd(),`public/assets/figma/about-${id}.svg`),'utf8');
    if(id===17)svg=svg.replace(/(<g id="lucide\/blocks">)[\s\S]*?(<\/g>)/,'$1<g fill="none" stroke="#2F43FC" stroke-width="2"><rect x="564.667" y="8961.25" width="10.667" height="10.667" rx="2"/><rect x="564.667" y="8971.92" width="10.667" height="10.667" rx="1"/><rect x="575.334" y="8971.92" width="10.667" height="10.667" rx="1"/><rect x="580.667" y="8955.92" width="10.667" height="10.667" rx="1.333"/></g>$2');
    return svg.replaceAll('crispEdges','geometricPrecision').replace(/(id="|href="#|url\(#)([^"\)]+)/g,'$1about-'+id+'-$2');
  }));
  const contactArtwork=(await readFile(path.join(process.cwd(),'public/assets/figma/contato-bleed.svg'),'utf8')).replace(/<\?xml[^>]*\?>/,'').replace(/(id="|href="#|url\(#)([^"\)]+)/g,'$1contact-art-$2');
  const faqArtwork=(await readFile(path.join(process.cwd(),'public/assets/figma/faq.svg'),'utf8')).replace(/(id="|href="#|url\(#)([^"\)]+)/g,'$1faq-art-$2');
  const overlay=await readFile(path.join(process.cwd(),'public/assets/figma/conversa-overlay.svg'),'utf8');
  const conversationArtwork=(await readFile(path.join(process.cwd(),'public/assets/figma/conversa-bleed.svg'),'utf8'))
    .replace(/<\?xml[^>]*\?>/,'').replace(/(id="|href="#|url\(#)([^"\)]+)/g,'$1conversation-art-$2');
  const appArtwork=Object.fromEntries(await Promise.all(['aplicativo-bleed','aplicativo-light-bleed','phone-project','phone-cases'].map(async name=>[name,(await readFile(path.join(process.cwd(),'public/assets/figma',name+'.svg'),'utf8')).replace(/<\?xml[^>]*\?>/,'').replace(/(id="|href="#|url\(#)([^"\)]+)/g,'$1'+name+'-$2')])));
  return <MotionRoot>
    <SiteHeader section={sections.find(s=>s.id==='cabecalho')!} />
    <main className="page-frame w-full mx-auto">
      {sections.filter(s=>!['cabecalho','rodape','clientes'].includes(s.id)).map(section=><div key={section.id} className={`section-band w-full${section.dark?' theme-dark':''}`}>
        {section.id==='sobre' ? <AboutSection section={section} icons={aboutIcons}/> : section.id==='processo' ? <ProcessSection section={section} artwork={processArtwork}/> : section.id==='metricas' ? <MetricsSection /> : <DesignSection section={section} contactArtwork={section.id==='contato'?contactArtwork:undefined} faqArtwork={section.id==='faq'?faqArtwork:undefined} appArtwork={section.id==='aplicativo'?appArtwork:undefined} conversationOverlay={section.id==='conversa'?overlay:undefined} conversationArtwork={section.id==='conversa'?conversationArtwork:undefined} />}
      </div>)}
    </main>
    <div className="footer-frame mx-auto"><DesignSection section={sections.find(s=>s.id==='rodape')!} footerArtwork={footerArtwork} /></div>
    <a className="floating-whatsapp button fixed z-30 rounded-full" href={WHATSAPP} tabIndex={-1} aria-hidden="true" aria-label="Conversar com a Beyond pelo WhatsApp"><Artwork src="assets/figma/whatsapp-icon.svg" className="figma-art button-icon" width={76} height={76} lazy={false} /></a>
  </MotionRoot>;
}
