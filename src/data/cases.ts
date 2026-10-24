import type { SectionData } from '@/lib/figma/design';
import { rawBlockText, requiredBlock, sectionHeading, textIn } from '@/lib/figma/content';

export type CaseProject = {
  category: string;
  title: string;
  description: string;
  result: string;
  resultCaption: string;
  quote: string;
  author: string;
  tags: string[];
};

export type CasesContent = {
  ariaLabel: string;
  label: string;
  heading: string;
  intro: string;
  names: string[];
  projects: CaseProject[];
  cta: string;
};

export function casesContent(section: SectionData): CasesContent {
  const heading = sectionHeading(section);
  if (!heading.label || !heading.title || !heading.subtitle)
    throw new Error('Missing cases heading');
  const names = ['Institut Pasteur_2', 'Starlog', 'Ayalla'].map((id) =>
    rawBlockText(requiredBlock(section, id)),
  );
  const cta = section.blocks.find(
    (block) => block.actionBox && block.ancestors.includes('primary_3'),
  );
  if (!cta) throw new Error('Missing case action');
  return {
    ariaLabel: section.label,
    label: rawBlockText(heading.label),
    heading: rawBlockText(heading.title),
    intro: rawBlockText(heading.subtitle),
    names,
    cta: rawBlockText(cta),
    projects: [
      {
        category: textIn(section, 'Paragraph_8'),
        title: rawBlockText(requiredBlock(section, 'Heading 3_6')),
        description: textIn(section, 'Container_18', 'p'),
        result: rawBlockText(requiredBlock(section, 'Heading 4')),
        resultCaption: rawBlockText(requiredBlock(section, 'Heading 5')),
        quote: textIn(section, 'Paragraph:margin_5'),
        author: textIn(section, 'Bold Text_4'),
        tags: [textIn(section, 'tag'), textIn(section, 'tag_2')],
      },
      {
        category: 'LOGÍSTICA · VISÃO DEMONSTRATIVA',
        title: names[1],
        description:
          'Uma visão integrada para acompanhar operações, organizar entregas e aproximar equipes. Um exemplo de como apresentar o projeto dentro da nova janela de cases.',
        result: 'Conexão',
        resultCaption: 'Da operação à informação, em um só lugar.',
        quote: 'Uma experiência desenhada para tornar operações complexas mais claras.',
        author: 'Conceito ilustrativo · não é um depoimento',
        tags: ['Plataforma web', 'Operações'],
      },
      {
        category: 'EXPERIÊNCIA DIGITAL · VISÃO DEMONSTRATIVA',
        title: names[2],
        description:
          'Uma experiência digital que simplifica jornadas e reúne informações importantes em uma interface intuitiva. Conteúdo de exemplo para explorar o ritmo e a transição entre projetos.',
        result: 'Simplicidade',
        resultCaption: 'Uma jornada fluida do início ao próximo passo.',
        quote: 'Menos atrito na navegação. Mais espaço para o que importa.',
        author: 'Conceito ilustrativo · não é um depoimento',
        tags: ['Produto digital', 'UX/UI'],
      },
    ],
  };
}
