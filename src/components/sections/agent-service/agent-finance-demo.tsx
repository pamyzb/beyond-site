'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  Landmark,
  Factory,
  PackageCheck,
  Headphones,
} from 'lucide-react';
import { Artwork } from '@/components/ui/artwork';
import './agent-finance.css';

const examples = [
  {
    label: 'Financeiro',
    icon: Landmark,
    title: 'Conciliação de recebimentos',
    summary: 'Total conciliado neste fluxo',
    result: 'R$ 1.250,00',
    initial: 'R$ 0,00',
    context: '1 cobrança ilustrativa · BRL',
    ledger: 'Recebimentos',
    item: 'Cobrança #0125',
    detail: 'Cliente Exemplo · lançamento #0125',
    amount: 'R$ 1.250,00',
    from: 'Valor da cobrança',
    to: 'Lançamento correspondente',
    statuses: ['Recebido', 'Conferindo dados', 'Conciliando', 'Conciliado'],
    image: 'erp-back-office.jpg',
    alt: 'Equipe acompanhando dados em sistemas de gestão',
  },
  {
    label: 'Produção',
    icon: Factory,
    title: 'Planejamento da produção',
    summary: 'Unidades programadas neste fluxo',
    result: '240 unidades',
    initial: '0 unidades',
    context: '1 lote ilustrativo · produção',
    ledger: 'Ordens de produção',
    item: 'Ordem #0240',
    detail: 'Lote Exemplo · materiais disponíveis',
    amount: '240 unidades',
    from: 'Demanda recebida',
    to: 'Ordem programada',
    statuses: ['Recebida', 'Conferindo materiais', 'Programando', 'Programada'],
    image: 'agenticos-cards.jpg',
    alt: 'Operação com apoio de colaboradores agênticos',
  },
  {
    label: 'Pedidos',
    icon: PackageCheck,
    title: 'Processamento de pedidos',
    summary: 'Pedidos encaminhados neste fluxo',
    result: '1 pedido',
    initial: '0 pedidos',
    context: '1 pedido ilustrativo · expedição',
    ledger: 'Pedidos recebidos',
    item: 'Pedido #0842',
    detail: 'Cliente Exemplo · 12 itens disponíveis',
    amount: '12 itens',
    from: 'Estoque conferido',
    to: 'Separação autorizada',
    statuses: ['Recebido', 'Conferindo estoque', 'Encaminhando', 'Encaminhado'],
    image: 'aplicativos-plataformas-web.jpg',
    alt: 'Equipe usando sistemas para acompanhar a operação',
  },
  {
    label: 'Atendimento',
    icon: Headphones,
    title: 'Triagem de atendimento',
    summary: 'Solicitações encaminhadas neste fluxo',
    result: '1 solicitação',
    initial: '0 solicitações',
    context: '1 atendimento ilustrativo · WhatsApp',
    ledger: 'Solicitações recebidas',
    item: 'Chamado #0318',
    detail: 'Cliente Exemplo · acompanhamento de pedido',
    amount: 'Prioridade normal',
    from: 'Solicitação identificada',
    to: 'Equipe responsável',
    statuses: ['Recebida', 'Identificando assunto', 'Direcionando', 'Encaminhada'],
    image: 'manutencao.jpg',
    alt: 'Profissional acompanhando solicitações em um computador',
  },
];

export function AgentFinanceDemo() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const id = useId();
  const example = examples[active];
  const select = (index: number, focus = false) => {
    setActive(index);
    if (focus) root.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[index]?.focus();
  };
  const [step, setStep] = useState(3);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timeline: gsap.core.Timeline | undefined;
    let visible = false;
    const sync = () => {
      if (!timeline) return;
      if (visible && !document.hidden && !preference.matches) timeline.play();
      else timeline.pause();
    };
    const configure = () => {
      timeline?.kill();
      if (preference.matches) {
        setStep(3);
        timeline = undefined;
        return;
      }
      setStep(0);
      timeline = gsap.timeline({ paused: true, repeat: -1 });
      timeline
        .call(() => setStep(0), [], 0)
        .call(() => setStep(1), [], 1.5)
        .call(() => setStep(2), [], 3)
        .call(() => setStep(3), [], 4.5)
        .to({}, { duration: 3.5 });
      sync();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    observer.observe(element);
    preference.addEventListener('change', configure);
    document.addEventListener('visibilitychange', sync);
    configure();
    return () => {
      timeline?.kill();
      observer.disconnect();
      preference.removeEventListener('change', configure);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [active]);

  return (
    <div
      ref={root}
      className="agent-finance-demo"
      data-step={step}
      aria-label="Demonstrações ilustrativas de operação automática"
    >
      <div className="case-browser-toolbar agent-finance-toolbar">
        <div className="case-window-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="case-navigation" aria-label="Navegação entre exemplos">
          <button
            type="button"
            aria-label="Exemplo anterior"
            disabled={active === 0}
            onClick={() => select(active - 1)}
          >
            <ChevronLeft size={18} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            aria-label="Próximo exemplo"
            disabled={active === examples.length - 1}
            onClick={() => select(active + 1)}
          >
            <ChevronRight size={18} strokeWidth={1.7} />
          </button>
        </div>
        <div className="case-tabs" role="tablist" aria-label="Exemplos de operação">
          {examples.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                className="case-tab agent-finance-tab"
                role="tab"
                aria-label={item.label}
                id={`${id}-tab-${index}`}
                aria-controls={`${id}-panel`}
                aria-selected={active === index}
                tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => {
                  const next =
                    event.key === 'ArrowRight'
                      ? (index + 1) % examples.length
                      : event.key === 'ArrowLeft'
                        ? (index + examples.length - 1) % examples.length
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? examples.length - 1
                            : null;
                  if (next !== null) {
                    event.preventDefault();
                    select(next, true);
                  }
                }}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="case-tab-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div
        className="agent-finance-workspace"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${active}`}
      >
        <header className="agent-finance-header">
          <div>
            <p>{example.title}</p>
          </div>
        </header>
        <div className="agent-finance-grid">
          <div className="agent-finance-main">
            <div className="agent-finance-summary">
              <span>{example.summary}</span>
              <strong className="agent-finance-total">
                {step === 3 ? example.result : example.initial}
              </strong>
              <span>{example.context}</span>
            </div>
            <div className="agent-finance-ledger">
              <div className="agent-finance-ledger-title">
                <FileCheck2 size={18} aria-hidden="true" />
                <strong>{example.ledger}</strong>
                <span>Hoje</span>
              </div>
              <div className="agent-finance-row">
                <div>
                  <strong>{example.item}</strong>
                  <span>{example.detail}</span>
                </div>
                <strong>{example.amount}</strong>
                <span className="agent-finance-status">{example.statuses[step]}</span>
              </div>
              <div className="agent-finance-match">
                <span>{example.from}</span>
                <strong>{example.amount}</strong>
                <ArrowRight size={16} aria-hidden="true" />
                <span>{example.to}</span>
                <strong>{example.amount}</strong>
              </div>
            </div>
          </div>
          <div className="case-visual agent-finance-visual">
            <Artwork
              src={`assets/servicos/${example.image}`}
              width={1600}
              height={900}
              alt={example.alt}
              className="case-project-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
