import type { SectionData } from '@/lib/figma/design';
import { rawBlockText, sectionHeading } from '@/lib/figma/content';

const definitions = [
  {
    id: 'Article_5',
    image: '/assets/servicos/produto-digital-b2c.jpg',
    description:
      'Da ideia ao lançamento, criamos produtos digitais intuitivos e preparados para crescer com o seu negócio e conquistar seus usuários.',
  },
  {
    id: 'Article_6',
    image: '/assets/servicos/erp-back-office.jpg',
    description:
      'Conectamos processos, dados e equipes em um sistema feito para sua operação, reduzindo tarefas manuais e facilitando a gestão do negócio.',
  },
  {
    id: 'Article_7',
    image: '/assets/servicos/aplicativos-plataformas-web.jpg',
    description:
      'Desenvolvemos aplicativos e plataformas web sob medida, com experiências simples de usar e tecnologia preparada para acompanhar seu crescimento.',
  },
];
export type ServicesContent = {
  ariaLabel: string;
  label: string;
  subtitle: string;
  cards: { id: string; title: string; description: string; image: string }[];
  agent: { title: string; description: string; cta: string };
};
export function servicesContent(section: SectionData): ServicesContent {
  const heading = sectionHeading(section);
  if (!heading.label || !heading.subtitle) throw new Error('Missing services heading');
  function text(id: string, role: 'h3' | 'p', action = false) {
    const block = section.blocks.find(
      (block) =>
        block.ancestors.includes(id) && block.role === role && !!block.actionBox === action,
    );
    if (!block) throw new Error(`Missing service content ${id}/${role}/${action}`);
    return rawBlockText(block);
  }
  return {
    ariaLabel: section.label,
    label: rawBlockText(heading.label),
    subtitle: rawBlockText(heading.subtitle),
    cards: definitions.map((card) => ({
      ...card,
      title:
        card.id === 'Article_7'
          ? 'Aplicativos, plataformas web e soluções de IA sob medida'
          : text(card.id, 'h3'),
    })),
    agent: {
      title: text('Article_10', 'h3'),
      description: text('Article_10', 'p'),
      cta: text('Article_10', 'p', true),
    },
  };
}
