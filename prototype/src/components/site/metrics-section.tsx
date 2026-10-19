"use client";
import {ClientDetailsCarousel} from './client-carousel';
import {ButtonLink} from './button';
import {CountUp} from './count-up';

const clients = [
  {key:'Article_2',name:'Institut Pasteur',summary:'Pesquisa científica em saúde',image:'/assets/clients/pasteur-logo.png',photo:'/assets/clients/pasteur-photo.jpg',photoAlt:'Fachada do Institut Pasteur'},
  {key:'mediapro',name:'Grup Mediapro',summary:'Grupo audiovisual que atua na produção de conteúdo, em serviços de mídia e em transmissões esportivas.',image:'/assets/clients/mediapro-logo.png',photo:'/assets/clients/mediapro-photo.jpg',photoAlt:'Sala de controle audiovisual do Grup Mediapro'},
  {key:'Article',name:'Universidade de São Paulo',summary:'Ensino, pesquisa e extensão',image:'/assets/clients/usp-logo.png',photo:'/assets/clients/usp-photo.jpg',photoAlt:'Placa da Universidade de São Paulo'},
  {key:'capital',name:'CM Capital',summary:'Empresa do setor financeiro que faz parte dos clientes da Beyond.',image:'/assets/clients/capital-logo.png',photo:'/assets/clients/capital-photo.jpg',photoAlt:'Recepção da CM Capital'},
  {key:'shc',name:'SHC',summary:'Organização do universo hípico que faz parte dos clientes da Beyond.',image:'/assets/clients/shc-logo.png',photo:'/assets/clients/shc-photo.jpg',photoAlt:'Vista das instalações da Sociedade Hípica Catarinense'},
  {key:'Article_3',name:'Superpet',summary:'Feira de negócios do setor pet',image:'/assets/clients/superpet-logo.png',photo:'/assets/clients/superpet-photo.jpg',photoAlt:'Mascote na feira Superpet'},
];

export function MetricsSection() {
  return <section id="metricas" className="impact-section impact-figma" aria-label="Beyond em números">
    <div className="impact-brands" id="clientes">
      <h2 data-motion="static">Empresas que <em>{'{crescem}'}</em> com a Beyond</h2>
      <ClientDetailsCarousel clients={clients}/>
    </div>
    <div className="impact-metrics-wrap">
      <div className="impact-panel">
        <div className="impact-patterns" aria-hidden="true">
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner =>
            <img key={corner} className={`impact-pattern impact-pattern-${corner}`} src={`/assets/figma/metrics-pattern-${corner}.svg`} alt="" />
          )}
        </div>
        <div className="impact-inner">
          <div className="impact-grid">
            <article className="impact-stat">
              <h3 aria-label="214.126"><span className="impact-live-dot" aria-hidden="true" /><CountUp value={214126}/></h3>
              <p>Usuários ativos nas nossas plataformas</p>
            </article>
            <article className="impact-stat">
              <h3 aria-label="Mais de 200"><span aria-hidden="true">+</span><CountUp value={200}/></h3>
              <p>Negócios transformados por tecnologia</p>
            </article>
            <article className="impact-stat">
              <h3 aria-label="Mais de 50 milhões"><span aria-hidden="true">+</span><CountUp value={50} suffix="M"/></h3>
              <p>Em valor recuperado através de eficiência<br className="impact-desktop-break" /> operacional</p>
            </article>
          </div>
          <div className="impact-press">
            <p>Destaque na mídia</p>
            <div className="impact-press-logos">
              <img src="/assets/press/estadao.png" alt="Estadão" width="140" height="48" />
              <img src="/assets/press/pegn.png" alt="Pequenas Empresas & Grandes Negócios" width="150" height="60" />
              <img src="/assets/press/valor.png" alt="Valor Econômico" width="130" height="48" />
              <a className="impact-press-profile" href="https://softdex.com.br/empresa/beyond-the-bytes" target="_blank" rel="noopener noreferrer" aria-label="Beyond the Bytes na Softdex (abre em nova aba)">
                <img src="/assets/press/softex.png" alt="Top 3 software house na Softdex" width="180" height="56" />
              </a>
            </div>
            <ButtonLink className="impact-press-link" href="#blog">Ver matérias<span className="impact-press-arrow" aria-hidden="true" /></ButtonLink>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
