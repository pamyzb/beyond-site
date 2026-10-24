# Revisão da V1 — responsividade, unidades e animação

Data: 24/10/2026. Escopo: implementação ativa na raiz do repositório, incluindo
`/` e `/design-system`. A composição de desktop permanece como referência.

## Diagnóstico e correções

- As seções tinham geometria de desktop sem uma adaptação completa para
  larguras menores. Foram adicionados contratos para cabeçalho/menu, hero,
  métricas, serviços, cases, conversa, aplicativo, depoimentos, processo,
  sobre, blog, FAQ, contato e rodapé.
- Grades e campos agora podem encolher; em telas menores, conteúdos passam
  para uma coluna. Seções passam a crescer com o texto.
- Cases tinham overflow interno mesmo sem overflow do documento: a largura
  mínima implícita da grade cortava descrições. As colunas e o painel usam
  `minmax(0, 1fr)` e `min-width: 0`; as interfaces demonstrativas têm altura
  suficiente para o conteúdo.
- A navegação móvel usa os mesmos links do desktop, fecha por Escape,
  navegação ou clique externo e não deixa links ocultos no percurso do Tab.
- Cases e serviços só prendem a rolagem com pelo menos 90em de largura,
  48em de altura, ponteiro preciso e movimento permitido. Fora dessas
  condições, cases usam abas e serviços usam scroll horizontal nativo,
  com controles por botão e teclado.
- O formulário usa colunas fluidas, ações que podem quebrar linha, erros
  em fluxo e textarea redimensionável. Os campos mantêm fonte de 1rem.
- A escala tipográfica do design system também foi atualizada; o título
  dessa página deixa de ser cortado no celular.
- O destino das âncoras considera o cabeçalho sem somar dois deslocamentos
  completos de header.

## Política de unidades

- `rem`: fontes, tracking fixo, espaçamento, controles, raios, limites de
  conteúdo e alturas mínimas da interface. Referência: 16px = 1rem.
- `em`: breakpoints, para acompanhar a preferência de fonte do navegador;
  detalhes que dependem diretamente da fonte local continuam em `em`.
- `%`, `fr`, `cqw`, viewport e `clamp()`: composição fluida. Os limites
  tipográficos de `clamp()` continuam em `rem`.
- `px`: bordas finas, coordenadas e viewBox do Figma, máscaras/SVGs,
  deslocamentos medidos pelo navegador e cálculos de canvas/GSAP.

Não há razão para converter o JSON do Figma nem coordenadas de canvas para
`rem`. A medição de texto usa o tamanho computado da fonte; os tamanhos
alternativos de `TextBlock` e o tracking passam pela mesma escala relativa.
A raiz usa `100%`, sem impor 16px ou aplicar 62.5%.

Os breakpoints principais são 90em, 60em e 37.5em (1440, 960 e 600px
na referência padrão). O rodapé conserva seus próprios pontos de quebra.

Nos cinco CSS revisados, as ocorrências numéricas de `px`, desconsiderando
comentários, caíram de 1.223 para 118. Não restaram declarações de
`font-size`, `letter-spacing` ou `line-height` em `px` nesses estilos.

## Decisão: manter GSAP

A V1 já usa timelines, ScrollTrigger, pin/scrub, caminhos e atributos SVG,
controle direto de carrossel e efeitos que acompanham o ponteiro. A integração
com `useGSAP` e `matchMedia` oferece o ciclo de vida necessário para reverter
animações quando as condições mudam.

Motion for React (antes Framer Motion) é uma boa opção para transições de
layout e presença declarativas em componentes React. Adicioná-lo agora
criaria uma segunda camada de animação sem substituir a maior parte do que
este site já faz. Não há benefício de desempenho medido que justifique a
migração. Hover, foco e acordeão continuam usando CSS quando isso basta.

Reavaliar Motion se o produto ganhar muitos estados de layout compartilhado,
rotas com transições ou componentes que precisem de animação de entrada e
saída ligada à montagem. Não adicionar duas bibliotecas ao mesmo elemento.

Referências oficiais: [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/),
[ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/),
[Motion para React](https://motion.dev/docs/react) e
[animações de layout do Motion](https://motion.dev/docs/react-layout-animations).

## Dependências e execução

- pnpm 10.26.0 fixado em `packageManager`; `pnpm-lock.yaml` substitui
  `package-lock.json`. Instalação reprodutível com
  `pnpm install --frozen-lockfile`.
- Scripts nativos permitidos explicitamente para Sharp e Tailwind no
  `pnpm-workspace.yaml`.
- Next.js atualizado de 16.4.0 para 16.4.1 após o audit apontar dois alertas
  críticos e um alto. O audit de produção passou sem alertas conhecidos.
  [Release oficial com as correções](https://github.com/vercel/next.js/releases/tag/v16.4.1).
- Exportação estática habilitada com `output: "export"` e
  `trailingSlash: true`. A entrega publicada é a pasta `out/`, sem servidor
  Next.js. Node.js fica restrito ao desenvolvimento e build.
- O `vercel.json` define `pnpm build` e saída `out`; a Root Directory do
  projeto na Vercel deve apontar para a raiz do repositório (campo vazio).
- `pnpm start` serve os arquivos exportados com `serve`, usado somente para
  prévia local. O patch de `compression` dessa ferramenta está fixado pelo
  override do pnpm; o audit completo permanece sem alertas conhecidos.

## Validação executada

`pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm build`,
`pnpm audit` e `git diff --check` concluídos sem falhas. As rotas `/` e
`/design-system` foram pré-renderizadas no build.

Medições no build de produção (largura em pixels CSS):

| Viewport | Área útil | Largura rolável do documento | Painéis fixados por scroll |
| --- | --- | --- | --- |
| 320 | 305 | 305 | 0 |
| 390 | 375 | 375 | 0 |
| 768 | 753 | 753 | 0 |
| 1024 | 1009 | 1009 | 0 |
| 1440 | 1425 | 1425 | 2 |
| 1920 | 1905 | 1905 | 2 |

- Em 320px, os títulos e parágrafos semânticos verificados não apresentaram
  overflow interno após a última correção.
- Menu: abrir/fechar, Escape e navegação para a seção do aplicativo.
- Serviços: botão seguinte deslocou o carrossel nativo.
- Cases: aba Starlog alterou o painel e `aria-selected`.
- FAQ: abertura atualizou `aria-expanded`.
- Blog: expansão aumentou de quatro para oito cartões.
- Contato: formulário vazio marcou os cinco campos, exibiu erros sem cortes
  e levou foco ao nome; nenhum envio externo foi realizado.
- Console sem erros em uma aba nova do build de produção.
- Na exportação estática: `/` e `/design-system/` responderam 200, uma URL
  inexistente respondeu 404, o SVG respondeu com MIME correto e o vídeo
  respondeu 206 a uma requisição parcial. Os assets locais referenciados
  pelos três HTMLs exportados (home, design system e 404) estão em `out/`.
- Menu e FAQ funcionaram na prévia estática; acesso direto e recarga de
  `/design-system/` passaram, sem erros de console. O deploy na Vercel não
  foi executado nesta revisão.

## Limites da revisão

A validação visual usa o navegador Chromium do ambiente, com barra de
rolagem ocupando 15px. Não substitui testes em aparelhos físicos, Safari,
VoiceOver ou preferências de fonte alteradas no sistema. Movimento reduzido
foi revisado no código; não foi emulado no sistema operacional.

Há conteúdo e integrações já existentes que precisam de definições reais:
idade da empresa exibida como “X anos”, artigos repetidos/demonstrativos,
cases Starlog/Ayalla ilustrativos, vídeo de depoimento não fornecido,
seletor de idioma sem tradução e formulário com confirmação simulada.
Esses itens não foram transformados em conteúdo ou serviços de produção
sem os dados correspondentes.
