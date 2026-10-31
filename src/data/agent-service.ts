export const agentService = {
  label: 'Colaboradores agênticos',
  title: 'Um agente sob medida que assume',
  titleAccent: 'todo o trabalho operacional da sua empresa',
  description:
    'Nossa remuneração é no sucesso: recebemos uma fração da economia gerada para sua empresa.',
  action: 'Transformar minha operação',
  resultsAction: 'Conhecer os resultados',
  scene: 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode',
  benefits: {
    label: 'Benefícios',
    title: 'Mais resultado.',
    accent: 'Menos esforço operacional',
    items: [
      { title: 'Economia de até 50% da sua folha.', description: '' },
      {
        title: 'Qualidade e assertividade em todos os processos.',
        description: 'Chega de dor de cabeça.',
      },
      { title: 'Dados e insights que impulsionam negócios.', description: '' },
    ],
  },
  remuneration: {
    label: 'Remuneração',
    title: 'Nossa remuneração acompanha a',
    accent: 'economia que geramos',
    description: 'A Beyond recebe uma fração da economia gerada para sua empresa.',
    closing: 'Nossa remuneração é no sucesso.',
  },
  // Preview composition only: client assignments, quotes and metrics await replacement.
  illustrativeCases: [
    {
      name: 'Grup Mediapro',
      logo: '/assets/clientes/mediapro-logo.png',
      segment: 'Produção audiovisual',
      revenue: 'R$ 40 a R$ 80 milhões',
      savings: '42%',
      metrics: ['Pedidos 12× mais rápidos', '95% de assertividade'],
      quote: 'A operação ganhou ritmo e nosso time passou a cuidar das decisões.',
    },
    {
      name: 'CM Capital',
      logo: '/assets/clientes/capital-logo.png',
      segment: 'Serviços financeiros',
      revenue: 'R$ 20 a R$ 60 milhões',
      savings: '38%',
      metrics: ['60% menos retrabalho', 'Conciliação 8× mais rápida'],
      quote: 'As rotinas passaram a avançar com menos acompanhamento manual.',
    },
    {
      name: 'Superpet',
      logo: '/assets/clientes/superpet-logo.png',
      segment: 'Eventos e negócios',
      revenue: 'R$ 10 a R$ 30 milhões',
      savings: '50%',
      metrics: ['Atendimento 6× mais rápido', '70% menos tarefas manuais'],
      quote: 'Agora temos mais clareza dos números e tempo para planejar.',
    },
  ],
  efficiency: {
    label: 'Eficiência',
    title: 'Veja a eficiência',
    accent: 'em operação',
    description: 'Do recebimento à conciliação, acompanhe um fluxo financeiro automático.',
  },
  about: {
    label: 'Sobre',
    title: 'Seu novo',
    accent: 'time operacional',
    paragraphs: [
      'Colaboradores agênticos são agentes de inteligência artificial desenvolvidos para executar atividades de ponta a ponta, seguindo os processos e as particularidades da sua empresa.',
      'A Beyond constrói a lógica e as integrações necessárias para que eles assumam tarefas operacionais, enquanto seu time concentra atenção na estratégia e nas decisões do negócio.',
    ],
    closing: 'O melhor do humano, com o melhor da IA.',
  },
  challenges: {
    label: 'O que resolvem',
    title: 'Cresça com',
    accent: 'menos peso',
    description:
      'Mais demanda costuma trazer mais contratações, treinamento, controles e custos. Mesmo assim, os atrasos continuam, os erros se repetem e a liderança precisa acompanhar cada detalhe.',
    items: [
      {
        title: 'Custos crescentes',
        description:
          'Folha, estrutura, equipamentos e licenças consomem uma parcela cada vez maior do resultado.',
      },
      {
        title: 'Cobrança constante',
        description: 'Tarefas repetitivas ocupam o time e exigem acompanhamento dos gestores.',
      },
      {
        title: 'Erros e retrabalho',
        description: 'Falhas recorrentes geram retrabalho e dificultam uma execução consistente.',
      },
      {
        title: 'Gargalos na operação',
        description:
          'Pedidos, conferências e outras atividades esperam por disponibilidade para avançar.',
      },
    ],
  },
  roles: {
    label: 'Como operam',
    title: 'Sua operação',
    accent: 'rodando sozinha',
    description:
      'Tecnologia não é ter um bom sistema se eu preciso de alguém operando. Nossos agentes executam os fluxos definidos para sua operação.',
    items: [
      {
        title: 'Estratégico',
        owner: 'Humano',
        description: 'Pessoas definem a direção, as prioridades e as decisões do negócio.',
      },
      {
        title: 'Tático',
        owner: 'Humano + IA',
        description:
          'Seu time trabalha com o apoio da IA e de informações que ajudam a tomar decisões.',
      },
      {
        title: 'Operacional',
        owner: 'IA',
        description:
          'Agentes assumem atividades repetitivas, com execução padronizada e disponibilidade para operar 24 horas por dia.',
      },
    ],
    closing: ['Humanos no estratégico.', 'IA no operacional.'],
  },
  results: {
    label: 'Cases',
    title: 'Impacto que',
    accent: 'se mede',
    description:
      'Menos trabalho operacional. Mais capacidade para crescer. Veja o impacto da automação nos indicadores do negócio.',
    note: 'Cases demonstrativos: não são resultados ou depoimentos verificados. Resultados reais dependem do contexto de cada operação.',
    // Copy approved on 2026-10-26 without a reporting period. Do not add the PDF's
    // undated “últimos 12 meses”; its industry footnote still needs source clarification.
    sectors: [
      {
        name: 'Distribuidoras',
        context: 'Faturamento anual entre R$ 40 milhões e R$ 300 milhões.',
        savings: '42% a 72%',
        metrics: [
          { label: 'Assertividade no faturamento', value: '4,2× mais' },
          { label: 'Agilidade nos pedidos', value: '36× mais' },
          { label: 'Tempo por pedido', value: '18 minutos → 30 segundos' },
        ],
      },
      {
        name: 'Indústria',
        context: 'Faturamento anual entre R$ 20 milhões e R$ 230 milhões.',
        savings: '38% a 67%',
        metrics: [
          { label: 'Assertividade no faturamento', value: '3,5× mais' },
          { label: 'Agilidade nos pedidos', value: '24× mais' },
          { label: 'Tempo por pedido', value: '12 minutos → 30 segundos' },
        ],
      },
    ],
  },
  applications: {
    label: 'Aplicações',
    title: 'Eficiência em',
    accent: 'cada área',
    description:
      'Identificamos atividades que podem ser assumidas por agentes a partir dos fluxos, dos sistemas e das necessidades do seu negócio.',
    items: [
      {
        title: 'Financeiro e faturamento',
        description:
          'Análise de crédito, emissão de notas fiscais, conciliação e contas a pagar e receber.',
      },
      {
        title: 'Pedidos e atendimento',
        description:
          'Recebimento de pedidos e atendimento pelo WhatsApp, conectados aos processos da empresa.',
      },
      {
        title: 'RH e administrativo',
        description:
          'Rotinas administrativas, controles em planilhas e tarefas repetitivas que ocupam a equipe.',
      },
      {
        title: 'Produção',
        description:
          'Aplicações voltadas à estratégia de produção, definidas a partir do diagnóstico da operação.',
      },
    ],
  },
  delivery: {
    label: 'Entrega',
    title: 'Queremos',
    accent: 'conhecer presencialmente',
    titleEnd: 'sua operação',
    description:
      'A Beyond cuida de cada etapa, da compreensão dos seus processos à evolução dos agentes.',
    steps: [
      {
        title: 'Conhecemos sua operação presencialmente',
        description:
          'Mapeamos pessoas, sistemas, rotinas e gargalos presencialmente para entender como o trabalho acontece e o que pode ser automatizado.',
      },
      {
        title: 'Desenvolvemos seus agentes',
        description:
          'Construímos agentes sob medida, com a lógica operacional e as integrações necessárias para assumir as atividades definidas no diagnóstico.',
      },
      {
        title: 'Implantamos e evoluímos com você',
        description:
          'Cuidamos da infraestrutura, manutenção e suporte. Acompanhamos mudanças nos processos e identificamos novas oportunidades de automação.',
      },
    ],
  },
} as const;
