import { readFile } from 'node:fs/promises';
import path from 'node:path';
import layout from '../../figma-layout.json';
import { type DesignData, WHATSAPP } from '@/lib/design';
import { SiteHeader } from '@/components/site/site-header';
import { MetricsSection } from '@/components/site/metrics-section';
import { DesignSection } from '@/components/site/design-section';
import { Artwork } from '@/components/site/artwork';
import { MotionRoot } from '@/components/motion/motion-root';

export default async function Home() {
  const {sections}=layout as DesignData;
  const overlay=await readFile(path.join(process.cwd(),'public/assets/figma/conversa-overlay.svg'),'utf8');
  return <MotionRoot>
    <SiteHeader section={sections.find(s=>s.id==='cabecalho')!} />
    <main className="page-frame w-full mx-auto">
      {sections.filter(s=>!['cabecalho','rodape','clientes'].includes(s.id)).map(section=><div key={section.id} className={`section-band w-full${section.dark?' theme-dark':''}`}>
        {section.id==='metricas' ? <MetricsSection clientsContent={<DesignSection section={sections.find(s=>s.id==='clientes')!} />} /> : <DesignSection section={section} conversationOverlay={section.id==='conversa'?overlay:undefined} />}
      </div>)}
    </main>
    <div className="footer-frame mx-auto"><DesignSection section={sections.find(s=>s.id==='rodape')!} /></div>
    <a className="floating-whatsapp fixed z-30 rounded-full" href={WHATSAPP} tabIndex={-1} aria-hidden="true" aria-label="Conversar com a Beyond pelo WhatsApp"><Artwork src="assets/figma/whatsapp.svg" width={76} height={76} lazy={false} /></a>
  </MotionRoot>;
}
