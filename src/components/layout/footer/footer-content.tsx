import type { RefObject } from 'react';
import { NAVIGATION, SOCIAL_LINKS, SITE_LINKS } from '@/data/navigation';
import { ButtonLink } from '@/components/ui/button';

function FooterDecorations({ bottomArtwork }: { bottomArtwork: string[] }) {
  return (
    <div className="footer-decorations" aria-hidden="true">
      <span className="footer-wave-background" />
      <img
        className="footer-decoration footer-decoration--top-left"
        src="/assets/rodape/left-top.svg"
        alt=""
      />
      <img
        className="footer-decoration footer-decoration--top-right"
        src="/assets/rodape/right-top.svg"
        alt=""
      />
      <div className="footer-decoration footer-decoration--bottom">
        {bottomArtwork.map((artwork, index) => (
          <span
            key={index}
            className={`footer-bottom-art footer-bottom-art--${index + 1}`}
            dangerouslySetInnerHTML={{ __html: artwork }}
          />
        ))}
      </div>
    </div>
  );
}

export function FooterContent({
  stageRef,
  bottomArtwork,
  homePath = '',
}: {
  stageRef: RefObject<HTMLDivElement | null>;
  bottomArtwork: string[];
  homePath?: string;
}) {
  return (
    <>
      <FooterDecorations bottomArtwork={bottomArtwork} />
      <div className="footer-layout">
        <a
          className="footer-brand-link"
          href={`${homePath}#inicio`}
          aria-label="Beyond the Bytes — voltar ao início"
        >
          <img src="/assets/compartilhados/brand.svg" width={220} height={23} alt="" />
        </a>
        <nav className="footer-nav" aria-label="Navegação do rodapé">
          {NAVIGATION.map((link) => (
            <a
              key={link.href}
              href={link.href === '#contato' ? link.href : `${homePath}${link.href}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <h2 className="footer-slogan">
          <span className="footer-slogan-lead">Impulsionando</span> empresas e<br />
          surpreendendo usuários.
        </h2>
        <div className="footer-socials" role="group" aria-label="Redes sociais">
          {SOCIAL_LINKS.map(({ name, label, href }) => (
            <a
              key={name}
              href={href}
              className="button footer-social"
              aria-label={label}
              target={name === 'email' ? undefined : '_blank'}
              rel={name === 'email' ? undefined : 'noopener noreferrer'}
            >
              <img
                className="button-icon"
                src={`/assets/rodape/footer-social-${name}.svg`}
                width={40}
                height={40}
                alt=""
              />
            </a>
          ))}
        </div>
        <div className="footer-badges">
          <a
            className="footer-badge-hit footer-badge-softex"
            href="https://softdex.com.br/empresa/beyond-the-bytes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Avalie-nos na Softdex (abre em nova aba)"
          />
          <button
            type="button"
            className="footer-badge-hit footer-badge-google"
            aria-label="Adicionar como fonte preferida no Google"
          />
        </div>
        <address className="footer-address">
          <span className="footer-address-copy">
            Rua Cardeal Arcoverde, 745
            <br />
            Pinheiros, São Paulo - SP
          </span>
          <ButtonLink className="footer-action" variant="primary-lime" href={SITE_LINKS.whatsapp}>
            Agende uma visita presencial
          </ButtonLink>
        </address>
        <div className="footer-contact">
          <a href={SITE_LINKS.phone}>+55 (11) 93619-1071</a>
          <a href={SITE_LINKS.email}>contato@beyondthebytes.com.br</a>
        </div>
      </div>
      <div className="footer-ground" aria-hidden="true" />
      <div ref={stageRef} className="footer-runner-stage" aria-hidden="true">
        <span className="footer-runner-pixel" />
      </div>
    </>
  );
}
