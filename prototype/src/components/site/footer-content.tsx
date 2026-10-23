import type { RefObject } from 'react';
import { WHATSAPP } from '@/lib/design';
import { ButtonLink } from './button';

const socialLinks=[
  { name: 'email', label: 'E-mail', href: 'mailto:contato@beyondthebytes.com.br' },
  { name: 'whatsapp', label: 'WhatsApp', href: WHATSAPP },
  { name: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/beyond-the-bytes/' },
  { name: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/beyond.thebytes/' },
  { name: 'x', label: 'X', href: 'https://x.com/beyondthebytes' },
];
const navigationLinks=[
  {label:'Serviços',href:'#servicos'}, {label:'Cases',href:'#cases'}, {label:'App Beyond',href:'#aplicativo'},
  {label:'Processo',href:'#processo'}, {label:'Blog',href:'#blog'}, {label:'Contato',href:'#contato'},
];

const bottomArtwork = Array.from({ length: 10 }, (_, index) => index + 1);

function FooterDecorations({ bottomArtwork }: { bottomArtwork: string[] }) {
  return <div className="footer-decorations" aria-hidden="true">
    <span className="footer-wave-background" />
    <img className="footer-decoration footer-decoration--top-left" src="/assets/footer/left-top.svg" alt="" />
    <img className="footer-decoration footer-decoration--top-right" src="/assets/footer/right-top.svg" alt="" />
    <div className="footer-decoration footer-decoration--bottom">
      {bottomArtwork.map((artwork, index) => <span key={index} className={`footer-bottom-art footer-bottom-art--${index + 1}`} dangerouslySetInnerHTML={{ __html: artwork }} />)}
    </div>
  </div>;
}

export function FooterContent({ stageRef, bottomArtwork }: { stageRef: RefObject<HTMLDivElement | null>; bottomArtwork: string[] }) {
  return <>
    <FooterDecorations bottomArtwork={bottomArtwork} />
    <div className="footer-layout">
      <a className="footer-brand-link" href="#inicio" aria-label="Beyond the Bytes — voltar ao início"><img src="/assets/figma/brand.svg" width={220} height={23} alt="" /></a>
      <nav className="footer-nav" aria-label="Navegação do rodapé">{navigationLinks.map(link=><a key={link.href} href={link.href}>{link.label}</a>)}</nav>
      <h2 className="footer-slogan">Impulsionando empresas e<br/>surpreendendo usuários.</h2>
      <div className="footer-socials" role="group" aria-label="Redes sociais">
        {socialLinks.map(({name,label,href}) => (<a key={name} href={href} className="button footer-social" aria-label={label} target={name === 'email' ? undefined : '_blank'} rel={name === 'email' ? undefined : 'noopener noreferrer'}><img className="button-icon" src={`/assets/figma/footer-social-${name}.svg`} width={40} height={40} alt="" /></a>))}
      </div>
      <div className="footer-badges"><a className="footer-badge-hit footer-badge-softex" href="https://softdex.com.br/empresa/beyond-the-bytes" target="_blank" rel="noopener noreferrer" aria-label="Avalie-nos na Softdex (abre em nova aba)" /><button type="button" className="footer-badge-hit footer-badge-google" aria-label="Adicionar como fonte preferida no Google" /></div>
      <address className="footer-address"><span className="footer-address-copy">Rua Cardeal Arcoverde, 745<br/>Pinheiros, São Paulo - SP</span><ButtonLink className="footer-action" variant="primary-lime" href="https://wa.me/5511936182404">Agende uma visita presencial</ButtonLink><ButtonLink className="footer-action footer-action-secondary" variant="secondary" href="https://www.google.com/maps/search/?api=1&amp;query=Rua+Cardeal+Arcoverde+745+Pinheiros+Sao+Paulo" target="_blank" rel="noopener noreferrer"><img className="button-icon" src="/assets/figma/button-icon-maps.svg" width={24} height={24} alt="" /><span>Ver a rota no Maps</span></ButtonLink></address>
      <div className="footer-contact"><a href="tel:+5511936182404">+55 (11) 93618-2404</a><a href="mailto:contato@beyondthebytes.com.br">contato@beyondthebytes.com.br</a></div>
    </div>
    <div className="footer-ground" aria-hidden="true" />
    <div ref={stageRef} className="footer-runner-stage" aria-hidden="true"><span className="footer-runner-pixel"/></div>
  </>;
}
